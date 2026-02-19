import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Loader2, AlertCircle, Pencil, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, Search, Filter, UploadCloud
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Exam {
  id: string;
  title: string;
  subject_id: string;
  duration_minutes: number | null;
  total_marks: number | null;
  is_published: boolean | null;
  created_at: string;
  subjects?: { name: string; slug: string } | null;
}

interface SubjectOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminExams() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "unpublished">("all");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Exam | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editSubject, setEditSubject] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, subject_id, duration_minutes, total_marks, is_published, created_at, subjects(name, slug)")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load exams", description: error.message, variant: "destructive" });
    } else {
      setExams((data as Exam[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.from("subjects").select("id, name, slug").order("display_order").then(({ data }) => {
      if (data) setSubjects(data);
    });
  }, []);

  useEffect(() => {
    if (isAdmin) fetchExams();
  }, [isAdmin]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <h1 className="font-heading font-bold text-xl text-foreground">Admin Access Only</h1>
      <p className="text-muted-foreground text-sm text-center">You don't have admin privileges.</p>
      <Link to="/" className="text-primary font-semibold text-sm hover:underline">← Go Home</Link>
    </div>
  );

  // Filtered exams
  const filtered = exams.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject ? e.subject_id === filterSubject : true;
    const matchPublished =
      filterPublished === "all" ? true :
      filterPublished === "published" ? !!e.is_published :
      !e.is_published;
    return matchSearch && matchSubject && matchPublished;
  });

  const handleTogglePublish = async (exam: Exam) => {
    const newState = !exam.is_published;
    const { error } = await supabase
      .from("exams")
      .update({ is_published: newState })
      .eq("id", exam.id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newState ? "✅ Published" : "🔒 Unpublished", description: `"${exam.title}" is now ${newState ? "live" : "hidden"}.` });
      setExams((prev) => prev.map((ex) => ex.id === exam.id ? { ...ex, is_published: newState } : ex));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // Delete questions first, then exam
    const { error: qErr } = await supabase.from("questions").delete().eq("exam_id", deleteTarget.id);
    if (qErr) {
      toast({ title: "Failed to delete questions", description: qErr.message, variant: "destructive" });
      setDeleting(false);
      return;
    }
    const { error } = await supabase.from("exams").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Failed to delete exam", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🗑️ Deleted", description: `"${deleteTarget.title}" has been removed.` });
      setExams((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    setDeleting(false);
  };

  const openEdit = (exam: Exam) => {
    setEditTarget(exam);
    setEditTitle(exam.title);
    setEditDuration(exam.duration_minutes ?? 30);
    setEditSubject(exam.subject_id);
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("exams")
      .update({ title: editTitle.trim(), duration_minutes: editDuration, subject_id: editSubject })
      .eq("id", editTarget.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Saved", description: "Exam updated successfully." });
      setExams((prev) =>
        prev.map((e) =>
          e.id === editTarget.id
            ? { ...e, title: editTitle.trim(), duration_minutes: editDuration, subject_id: editSubject,
                subjects: subjects.find(s => s.id === editSubject) ? { name: subjects.find(s => s.id === editSubject)!.name, slug: subjects.find(s => s.id === editSubject)!.slug } : e.subjects }
            : e
        )
      );
      setEditTarget(null);
    }
    setSaving(false);
  };

  const publishedCount = exams.filter(e => e.is_published).length;
  const unpublishedCount = exams.filter(e => !e.is_published).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/profile" className="inline-flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">📋 Manage Exams</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Edit, publish, or delete uploaded exams</p>
        <div className="flex gap-3 mt-4">
          <div className="bg-primary-foreground/10 rounded-xl px-4 py-2 text-center">
            <p className="text-primary-foreground font-bold text-lg">{exams.length}</p>
            <p className="text-primary-foreground/70 text-xs">Total</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl px-4 py-2 text-center">
            <p className="text-primary-foreground font-bold text-lg">{publishedCount}</p>
            <p className="text-primary-foreground/70 text-xs">Live</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl px-4 py-2 text-center">
            <p className="text-primary-foreground font-bold text-lg">{unpublishedCount}</p>
            <p className="text-primary-foreground/70 text-xs">Hidden</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Filters */}
        <div className="bg-card rounded-2xl p-3 shadow-card border border-border/50 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value as typeof filterPublished)}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>

        {/* Upload shortcut */}
        <Link to="/admin/upload">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Upload New Exam (JSON)</span>
          </div>
        </Link>

        {/* Exam list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No exams found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((exam) => (
              <div
                key={exam.id}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        exam.is_published
                          ? "bg-accent/15 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {exam.is_published
                          ? <><CheckCircle className="h-3 w-3" /> Live</>
                          : <><XCircle className="h-3 w-3" /> Hidden</>
                        }
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {exam.subjects?.name ?? "Unknown Subject"}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-foreground mt-1 truncate">{exam.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exam.total_marks ?? 0} questions · {exam.duration_minutes ?? 30} min
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(exam)}
                      title={exam.is_published ? "Unpublish" : "Publish"}
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      {exam.is_published
                        ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                        : <Eye className="h-4 w-4 text-primary" />
                      }
                    </button>
                    <button
                      onClick={() => openEdit(exam)}
                      title="Edit"
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(exam)}
                      title="Delete"
                      className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteTarget?.title}"</strong> and all its questions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Subject</label>
              <select
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
              >
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Exam Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Duration (minutes)</label>
              <Input
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                min={5}
                max={180}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
