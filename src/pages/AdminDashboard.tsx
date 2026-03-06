import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Loader2, AlertCircle, Pencil, Trash2, Eye, EyeOff,
  CheckCircle, XCircle, Search, Upload, FileJson, BookOpen, Video,
  FileText, Plus, Link as LinkIcon, X, FolderPlus, Folder, FolderOpen, ChevronRight,
  AlertTriangle, Download, MessageSquare, Send, Image as ImageIcon
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface SubjectOption { id: string; name: string; slug: string; }
interface Exam {
  id: string; title: string; subject_id: string; state: string;
  duration_minutes: number | null; total_marks: number | null;
  is_published: boolean | null; created_at: string;
  subjects?: { name: string; slug: string } | null;
}
interface Material {
  id: string; title: string; description: string | null; subject_id: string;
  file_url: string | null; file_type: string | null; is_published: boolean | null;
  created_at: string; folder_id: string | null; subjects?: { name: string } | null;
}
interface ClassItem {
  id: string; title: string; description: string | null; subject_id: string;
  video_url: string | null; duration_minutes: number | null; is_published: boolean | null;
  created_at: string; subjects?: { name: string } | null;
}
interface FolderItem {
  id: string; name: string; subject_id: string; state: string; created_at: string;
}

type Tab = "exams" | "material" | "classes";

interface QuestionJSON { question: string; options: string[]; answer_index: number; }

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("exams");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [search, setSearch] = useState("");

  // ─── Exams state ───
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Exam | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState(30);
  const [editSubject, setEditSubject] = useState("");
  const [saving, setSaving] = useState(false);

  // ─── Upload state ───
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadState, setUploadState] = useState("both");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDuration, setUploadDuration] = useState(30);
  const [jsonData, setJsonData] = useState<QuestionJSON[] | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Exam filters ───
  const [examFilterState, setExamFilterState] = useState("");
  const [examFilterSubject, setExamFilterSubject] = useState("");

  // ─── Material / Folder state ───
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [matFilterState, setMatFilterState] = useState("");
  const [matFilterSubject, setMatFilterSubject] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);

  // Create folder
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderState, setNewFolderState] = useState("both");
  const [newFolderSubject, setNewFolderSubject] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Upload to folder
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFiles, setMatFiles] = useState<File[]>([]);
  const [matUploading, setMatUploading] = useState(false);
  const matFileRef = useRef<HTMLInputElement>(null);

  // Delete folder
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  // ─── Classes state ───
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showAddClass, setShowAddClass] = useState(false);
  const [classTitle, setClassTitle] = useState("");
  const [classDesc, setClassDesc] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [classState, setClassState] = useState("both");
  const [classUrl, setClassUrl] = useState("");
  const [classDuration, setClassDuration] = useState(60);
  const [classAdding, setClassAdding] = useState(false);

  // Load subjects
  useEffect(() => {
    supabase.from("subjects").select("id, name, slug").order("display_order").then(({ data }) => {
      if (data) setSubjects(data);
    });
  }, []);

  // Load exams
  const fetchExams = async () => {
    setExamsLoading(true);
    const { data } = await supabase
      .from("exams")
      .select("id, title, subject_id, state, duration_minutes, total_marks, is_published, created_at, subjects(name, slug)")
      .order("created_at", { ascending: false });
    setExams((data as Exam[]) || []);
    setExamsLoading(false);
  };

  // Load folders
  const fetchFolders = async () => {
    setFoldersLoading(true);
    const { data } = await supabase
      .from("folders")
      .select("id, name, subject_id, state, created_at")
      .order("created_at", { ascending: false });
    setFolders((data as FolderItem[]) || []);
    setFoldersLoading(false);
  };

  // Load materials
  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    const { data } = await supabase
      .from("materials")
      .select("id, title, description, subject_id, file_url, file_type, is_published, created_at, folder_id, subjects(name)")
      .order("created_at", { ascending: false });
    setMaterials((data as Material[]) || []);
    setMaterialsLoading(false);
  };

  // Load classes
  const fetchClasses = async () => {
    setClassesLoading(true);
    const { data } = await supabase
      .from("classes")
      .select("id, title, description, subject_id, video_url, duration_minutes, is_published, created_at, subjects(name)")
      .order("created_at", { ascending: false });
    setClasses((data as ClassItem[]) || []);
    setClassesLoading(false);
  };

  useEffect(() => {
    if (isAdmin) { fetchExams(); fetchMaterials(); fetchClasses(); fetchFolders(); }
  }, [isAdmin]);

  // Auth guards
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <h1 className="font-heading font-bold text-xl text-foreground">Admin Access Only</h1>
      <Link to="/" className="text-primary font-semibold text-sm hover:underline">← Go Home</Link>
    </div>
  );

  // ─── Exam handlers ───
  const handleTogglePublish = async (exam: Exam) => {
    const v = !exam.is_published;
    await supabase.from("exams").update({ is_published: v }).eq("id", exam.id);
    setExams(p => p.map(e => e.id === exam.id ? { ...e, is_published: v } : e));
    toast({ title: v ? "✅ Published" : "🔒 Hidden" });
  };

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("questions").delete().eq("exam_id", deleteTarget.id);
    await supabase.from("exams").delete().eq("id", deleteTarget.id);
    setExams(p => p.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
    toast({ title: "🗑️ Deleted" });
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setSaving(true);
    await supabase.from("exams").update({ title: editTitle.trim(), duration_minutes: editDuration, subject_id: editSubject }).eq("id", editTarget.id);
    setExams(p => p.map(e => e.id === editTarget.id ? { ...e, title: editTitle.trim(), duration_minutes: editDuration, subject_id: editSubject, subjects: subjects.find(s => s.id === editSubject) ? { name: subjects.find(s => s.id === editSubject)!.name, slug: subjects.find(s => s.id === editSubject)!.slug } : e.subjects } : e));
    setEditTarget(null);
    setSaving(false);
    toast({ title: "✅ Saved" });
  };

  // ─── Upload handler ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
        for (let i = 0; i < parsed.length; i++) {
          const q = parsed[i];
          if (!q.question || !Array.isArray(q.options) || typeof q.answer_index !== "number") throw new Error(`Q${i + 1}: Invalid format`);
        }
        setJsonData(parsed);
        toast({ title: `✅ ${parsed.length} questions detected` });
      } catch (err: any) {
        setJsonData(null);
        toast({ title: "❌ Invalid JSON", description: err.message, variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!jsonData || !uploadSubject || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      const { data: exam, error } = await supabase.from("exams").insert({ subject_id: uploadSubject, title: uploadTitle.trim(), duration_minutes: uploadDuration, total_marks: jsonData.length, created_by: user!.id, is_published: false, state: uploadState }).select("id").single();
      if (error) throw error;
      const BATCH = 100;
      for (let i = 0; i < jsonData.length; i += BATCH) {
        const batch = jsonData.slice(i, i + BATCH).map((q, j) => ({ exam_id: exam.id, question_text: q.question, options: q.options, answer_index: q.answer_index, display_order: i + j + 1 }));
        await supabase.from("questions").insert(batch);
      }
      toast({ title: `🎉 ${jsonData.length} questions uploaded!` });
      setShowUpload(false); setJsonData(null); setUploadFileName(""); setUploadTitle(""); setUploadSubject(""); setUploadState("both");
      if (fileRef.current) fileRef.current.value = "";
      fetchExams();
    } catch (err: any) {
      toast({ title: "❌ Failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  // ─── Folder handlers ───
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !newFolderSubject) return;
    setCreatingFolder(true);
    try {
      await supabase.from("folders").insert({
        name: newFolderName.trim(),
        subject_id: newFolderSubject,
        state: newFolderState,
        created_by: user!.id,
      });
      toast({ title: "📁 Folder created!" });
      setShowCreateFolder(false); setNewFolderName(""); setNewFolderSubject(""); setNewFolderState("both");
      fetchFolders();
    } catch (err: any) {
      toast({ title: "❌ Failed", description: err.message, variant: "destructive" });
    }
    setCreatingFolder(false);
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    setDeletingFolder(true);
    // Materials inside will be cascade deleted
    await supabase.from("folders").delete().eq("id", deleteFolderTarget.id);
    setFolders(p => p.filter(f => f.id !== deleteFolderTarget.id));
    setMaterials(p => p.filter(m => m.folder_id !== deleteFolderTarget.id));
    if (selectedFolder?.id === deleteFolderTarget.id) setSelectedFolder(null);
    setDeleteFolderTarget(null);
    setDeletingFolder(false);
    toast({ title: "🗑️ Folder deleted" });
  };

  // ─── Material handler (into folder) ───
  const handleAddMaterial = async () => {
    if (!selectedFolder || matFiles.length === 0) return;
    setMatUploading(true);
    try {
      for (const file of matFiles) {
        const ext = file.name.split('.').pop();
        const path = `${selectedFolder.subject_id}/${selectedFolder.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("materials").getPublicUrl(path);
        const title = matTitle.trim() ? (matFiles.length === 1 ? matTitle.trim() : `${matTitle.trim()} - ${file.name}`) : file.name;
        await supabase.from("materials").insert({
          subject_id: selectedFolder.subject_id,
          title,
          description: matDesc.trim() || null,
          file_url: urlData.publicUrl,
          file_type: ext,
          created_by: user!.id,
          state: selectedFolder.state,
          folder_id: selectedFolder.id,
        });
      }
      toast({ title: `✅ ${matFiles.length} file(s) uploaded!` });
      setShowAddMaterial(false); setMatTitle(""); setMatDesc(""); setMatFiles([]);
      fetchMaterials();
    } catch (err: any) {
      toast({ title: "❌ Failed", description: err.message, variant: "destructive" });
    }
    setMatUploading(false);
  };

  // ─── Class handler ───
  const handleAddClass = async () => {
    if (!classTitle.trim() || !classSubject || !classUrl.trim()) return;
    setClassAdding(true);
    try {
      await supabase.from("classes").insert({ subject_id: classSubject, title: classTitle.trim(), description: classDesc.trim() || null, video_url: classUrl.trim(), duration_minutes: classDuration, created_by: user!.id, state: classState });
      toast({ title: "✅ Class added!" });
      setShowAddClass(false); setClassTitle(""); setClassDesc(""); setClassSubject(""); setClassState("both"); setClassUrl(""); setClassDuration(60);
      fetchClasses();
    } catch (err: any) {
      toast({ title: "❌ Failed", description: err.message, variant: "destructive" });
    }
    setClassAdding(false);
  };

  // Toggle publish for materials/classes
  const toggleMaterialPublish = async (m: Material) => {
    const v = !m.is_published;
    await supabase.from("materials").update({ is_published: v }).eq("id", m.id);
    setMaterials(p => p.map(x => x.id === m.id ? { ...x, is_published: v } : x));
  };
  const toggleClassPublish = async (c: ClassItem) => {
    const v = !c.is_published;
    await supabase.from("classes").update({ is_published: v }).eq("id", c.id);
    setClasses(p => p.map(x => x.id === c.id ? { ...x, is_published: v } : x));
  };

  // Delete material/class
  const deleteMaterial = async (id: string) => {
    await supabase.from("materials").delete().eq("id", id);
    setMaterials(p => p.filter(x => x.id !== id));
    toast({ title: "🗑️ Material deleted" });
  };
  const deleteClass = async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    setClasses(p => p.filter(x => x.id !== id));
    toast({ title: "🗑️ Class deleted" });
  };

  const tabs: { id: Tab; label: string; icon: typeof FileText; count: number }[] = [
    { id: "exams", label: "Exams", icon: FileText, count: exams.length },
    { id: "material", label: "Material", icon: BookOpen, count: materials.length },
    { id: "classes", label: "Classes", icon: Video, count: classes.length },
  ];

  const filteredExams = exams.filter(e => {
    if (examFilterState && e.state !== examFilterState && e.state !== "both") return false;
    if (examFilterSubject && e.subject_id !== examFilterSubject) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filteredClasses = classes.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  // Filtered folders by state & subject
  const filteredFolders = folders.filter(f => {
    if (matFilterState && f.state !== matFilterState && f.state !== "both") return false;
    if (matFilterSubject && f.subject_id !== matFilterSubject) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Materials inside selected folder
  const folderMaterials = selectedFolder
    ? materials.filter(m => m.folder_id === selectedFolder.id)
    : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 pt-4 pb-6">
        <Link to="/profile" className="inline-flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground mb-2">
          <ArrowLeft className="h-5 w-5" /><span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">🛡️ Admin Dashboard</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Manage exams, materials & classes</p>
        <div className="flex gap-3 mt-3">
          {tabs.map(t => (
            <div key={t.id} className="bg-primary-foreground/10 rounded-xl px-3 py-1.5 text-center">
              <p className="text-primary-foreground font-bold text-lg">{t.count}</p>
              <p className="text-primary-foreground/70 text-[10px]">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {/* Tabs */}
        <div className="bg-card rounded-2xl p-1 shadow-card border border-border/50 flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedFolder(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl h-10" />
        </div>

        {/* ═══ EXAMS TAB ═══ */}
        {tab === "exams" && (
          <div className="space-y-3">
            {/* State & Subject filters */}
            <div className="flex gap-2">
              <select value={examFilterState} onChange={e => setExamFilterState(e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">All States</option>
                <option value="ap">AP</option>
                <option value="ts">TS</option>
                <option value="both">Both</option>
              </select>
              <select value={examFilterSubject} onChange={e => setExamFilterSubject(e.target.value)} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button onClick={() => setShowUpload(true)} className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Upload New Exam (JSON)</span>
            </button>

            {examsLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div> :
            filteredExams.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No exams found</p> :
            filteredExams.map(exam => (
              <div key={exam.id} className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${exam.is_published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {exam.is_published ? <><CheckCircle className="h-3 w-3" /> Live</> : <><XCircle className="h-3 w-3" /> Hidden</>}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase">
                        {exam.state || "both"}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-foreground mt-1 truncate">{exam.title}</h3>
                    <p className="text-xs text-muted-foreground">{exam.subjects?.name} · {exam.total_marks ?? 0}Q · {exam.duration_minutes ?? 30}min</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleTogglePublish(exam)} className="p-2 rounded-xl hover:bg-muted"><Eye className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => { setEditTarget(exam); setEditTitle(exam.title); setEditDuration(exam.duration_minutes ?? 30); setEditSubject(exam.subject_id); }} className="p-2 rounded-xl hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(exam)} className="p-2 rounded-xl hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ MATERIAL TAB ═══ */}
        {tab === "material" && (
          <div className="space-y-3">
            {/* State & Subject filters */}
            <div className="flex gap-2">
              <select value={matFilterState} onChange={e => { setMatFilterState(e.target.value); setSelectedFolder(null); }} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">All States</option>
                <option value="ap">AP</option>
                <option value="ts">TS</option>
                <option value="both">Both</option>
              </select>
              <select value={matFilterSubject} onChange={e => { setMatFilterSubject(e.target.value); setSelectedFolder(null); }} className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button onClick={() => setShowCreateFolder(true)} className="flex-1 bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center justify-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">New Folder</span>
              </button>
            </div>

            {selectedFolder ? (
              /* ── Inside a folder ── */
              <div className="space-y-3">
                <button onClick={() => setSelectedFolder(null)} className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
                  <ArrowLeft className="h-4 w-4" /> Back to Folders
                </button>
                <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{selectedFolder.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {subjects.find(s => s.id === selectedFolder.subject_id)?.name} · {selectedFolder.state.toUpperCase()} · {folderMaterials.length} files
                      </p>
                    </div>
                  </div>
                </div>

                <button onClick={() => setShowAddMaterial(true)} className="w-full bg-accent/10 border border-accent/20 rounded-2xl p-3 flex items-center gap-3">
                  <Upload className="h-5 w-5 text-accent" />
                  <span className="text-sm font-semibold text-accent">Upload Files to this Folder</span>
                </button>

                {materialsLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div> :
                folderMaterials.length === 0 ? <p className="text-center text-muted-foreground text-sm py-6">No files in this folder</p> :
                folderMaterials.map(m => (
                  <div key={m.id} className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${m.is_published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                          {m.is_published ? "Live" : "Hidden"}
                        </span>
                        <h3 className="font-heading font-semibold text-sm text-foreground mt-1 truncate">{m.title}</h3>
                        <p className="text-xs text-muted-foreground">{m.file_type?.toUpperCase()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => toggleMaterialPublish(m)} className="p-2 rounded-xl hover:bg-muted">
                          {m.is_published ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                        </button>
                        <button onClick={() => deleteMaterial(m.id)} className="p-2 rounded-xl hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Folder list ── */
              <div className="space-y-2">
                {foldersLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div> :
                filteredFolders.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No folders yet. Create one first!</p> :
                filteredFolders.map(f => {
                  const count = materials.filter(m => m.folder_id === f.id).length;
                  return (
                    <div key={f.id} className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex items-center gap-3">
                      <button onClick={() => setSelectedFolder(f)} className="flex-1 flex items-center gap-3 text-left">
                        <Folder className="h-6 w-6 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-sm text-foreground truncate">{f.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {subjects.find(s => s.id === f.subject_id)?.name} · {f.state.toUpperCase()} · {count} files
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                      <button onClick={() => setDeleteFolderTarget(f)} className="p-2 rounded-xl hover:bg-destructive/10 shrink-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ CLASSES TAB ═══ */}
        {tab === "classes" && (
          <div className="space-y-3">
            <button onClick={() => setShowAddClass(true)} className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3">
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Add Class (Video Link)</span>
            </button>

            {classesLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div> :
            filteredClasses.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No classes yet</p> :
            filteredClasses.map(c => (
              <div key={c.id} className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${c.is_published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {c.is_published ? "Live" : "Hidden"}
                    </span>
                    <h3 className="font-heading font-semibold text-sm text-foreground mt-1 truncate">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.subjects?.name} · {c.duration_minutes}min</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleClassPublish(c)} className="p-2 rounded-xl hover:bg-muted">
                      {c.is_published ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
                    </button>
                    <button onClick={() => deleteClass(c.id)} className="p-2 rounded-xl hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ UPLOAD EXAM DIALOG ═══ */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Upload Exam (JSON)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">1. Select State</label>
            <select value={uploadState} onChange={e => setUploadState(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="both">Both States</option>
              <option value="ap">AP Only</option>
              <option value="ts">TS Only</option>
            </select>
            <label className="text-sm font-semibold text-foreground">2. Select Subject</label>
            <select value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="text-sm font-semibold text-foreground">3. Exam Details</label>
            <Input placeholder="Exam Title" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="rounded-xl" />
            <Input type="number" placeholder="Duration (min)" value={uploadDuration} onChange={e => setUploadDuration(Number(e.target.value))} min={5} max={180} className="rounded-xl" />
            <label className="text-sm font-semibold text-foreground">4. Upload JSON</label>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/60">
              <FileJson className="h-8 w-8 text-primary mx-auto mb-1" />
              <p className="text-sm font-semibold">{uploadFileName || "Select JSON file"}</p>
            </div>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
            {jsonData && <p className="text-xs text-accent font-semibold">✅ {jsonData.length} questions ready</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!jsonData || !uploadSubject || !uploadTitle.trim() || uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ CREATE FOLDER DIALOG ═══ */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">1. Select State</label>
            <select value={newFolderState} onChange={e => setNewFolderState(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="both">Both States</option>
              <option value="ap">AP Only</option>
              <option value="ts">TS Only</option>
            </select>
            <label className="text-sm font-semibold text-foreground">2. Select Subject</label>
            <select value={newFolderSubject} onChange={e => setNewFolderSubject(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="text-sm font-semibold text-foreground">3. Folder Name</label>
            <Input placeholder="e.g., Chapter 1 Notes" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || !newFolderSubject || creatingFolder}>
              {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <FolderPlus className="h-4 w-4 mr-1" />}Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ UPLOAD FILES TO FOLDER DIALOG ═══ */}
      <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Upload to "{selectedFolder?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title (optional, defaults to filename)" value={matTitle} onChange={e => setMatTitle(e.target.value)} className="rounded-xl" />
            <Input placeholder="Description (optional)" value={matDesc} onChange={e => setMatDesc(e.target.value)} className="rounded-xl" />
            <div onClick={() => matFileRef.current?.click()} className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center cursor-pointer hover:border-primary/60">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-1" />
              <p className="text-sm font-semibold">{matFiles.length > 0 ? `${matFiles.length} file(s) selected` : "Select Files (multi-select)"}</p>
              {matFiles.length > 0 && <p className="text-xs text-muted-foreground mt-1">{matFiles.map(f => f.name).join(", ")}</p>}
            </div>
            <input ref={matFileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg,.webp" multiple onChange={e => setMatFiles(e.target.files ? Array.from(e.target.files) : [])} className="hidden" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMaterial(false)}>Cancel</Button>
            <Button onClick={handleAddMaterial} disabled={matFiles.length === 0 || matUploading}>
              {matUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Upload {matFiles.length > 1 ? `(${matFiles.length})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ ADD CLASS DIALOG ═══ */}
      <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={classSubject} onChange={e => setClassSubject(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={classState} onChange={e => setClassState(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              <option value="both">Both States</option>
              <option value="ap">AP Only</option>
              <option value="ts">TS Only</option>
            </select>
            <Input placeholder="Class Title" value={classTitle} onChange={e => setClassTitle(e.target.value)} className="rounded-xl" />
            <Input placeholder="Description (optional)" value={classDesc} onChange={e => setClassDesc(e.target.value)} className="rounded-xl" />
            <Input placeholder="YouTube / Video URL" value={classUrl} onChange={e => setClassUrl(e.target.value)} className="rounded-xl" />
            <Input type="number" placeholder="Duration (min)" value={classDuration} onChange={e => setClassDuration(Number(e.target.value))} min={1} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClass(false)}>Cancel</Button>
            <Button onClick={handleAddClass} disabled={!classTitle.trim() || !classSubject || !classUrl.trim() || classAdding}>
              {classAdding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Add Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE EXAM DIALOG ═══ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>"{deleteTarget?.title}" and all its questions will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ DELETE FOLDER DIALOG ═══ */}
      <AlertDialog open={!!deleteFolderTarget} onOpenChange={o => !o && setDeleteFolderTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteFolderTarget?.name}" and all files inside will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFolder}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} disabled={deletingFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══ EDIT EXAM DIALOG ═══ */}
      <Dialog open={!!editTarget} onOpenChange={o => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="rounded-xl" />
            <Input type="number" value={editDuration} onChange={e => setEditDuration(Number(e.target.value))} min={5} max={180} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
