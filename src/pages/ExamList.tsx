import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApproval } from "@/hooks/useApproval";
import { ArrowLeft, FileText, Clock, Loader2, Lock, Folder, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks: number;
  created_at: string;
  folder_id: string | null;
}
interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
}

export default function ExamList() {
  const { subjectSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const folderParam = searchParams.get("folder");
  const { user } = useAuth();
  const { isApproved } = useApproval();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<FolderItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: subject } = await supabase
        .from("subjects").select("id, name").eq("slug", subjectSlug).maybeSingle();
      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      const [{ data: examsData }, { data: foldersData }] = await Promise.all([
        supabase.from("exams")
          .select("id, title, duration_minutes, total_marks, created_at, folder_id")
          .eq("subject_id", subject.id).eq("is_published", true)
          .order("created_at", { ascending: false }),
        supabase.from("folders")
          .select("id, name, parent_id, kind, subject_id")
          .eq("subject_id", subject.id).eq("kind", "exam"),
      ]);
      setExams(examsData || []);
      setFolders((foldersData as FolderItem[]) || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug]);

  // Resolve path from query param
  useEffect(() => {
    if (!folderParam) { setPath([]); return; }
    // Build path by walking parents
    const map = new Map(folders.map(f => [f.id, f]));
    const stack: FolderItem[] = [];
    let cur = map.get(folderParam);
    while (cur) { stack.unshift(cur); cur = cur.parent_id ? map.get(cur.parent_id) : undefined; }
    setPath(stack);
  }, [folderParam, folders]);

  const currentFolder = path[path.length - 1] || null;
  const subFolders = folders.filter(f => (f.parent_id || null) === (currentFolder?.id || null));
  const currentExams = exams.filter(e => (e.folder_id || null) === (currentFolder?.id || null));

  const goToFolder = (id: string | null) => {
    if (id) setSearchParams({ folder: id });
    else setSearchParams({});
  };

  const handleExamClick = (e: React.MouseEvent) => {
    if (!user) { navigate("/auth"); return; }
    if (!isApproved) {
      e.preventDefault();
      toast({ title: "🔒 Premium Content", description: "Admin approval needed. Contact admin to unlock." });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={`/subject/${subjectSlug}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" /><span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName} Exams</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{exams.length} exams total</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Breadcrumb */}
        {(path.length > 0 || subFolders.length > 0) && (
          <div className="bg-card rounded-2xl p-2 shadow-card border border-border/50 flex items-center gap-1 flex-wrap text-sm overflow-x-auto">
            <button onClick={() => goToFolder(null)} className={`px-2 py-1 rounded-lg font-semibold ${path.length === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>📁 All</button>
            {path.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <button onClick={() => goToFolder(f.id)} className={`px-2 py-1 rounded-lg font-semibold ${i === path.length - 1 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{f.name}</button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <>
            {/* Sub-folders */}
            {subFolders.map((f, i) => {
              const examCount = exams.filter(e => e.folder_id === f.id).length;
              const subCount = folders.filter(x => x.parent_id === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => goToFolder(f.id)}
                  className="w-full animate-slide-up bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-3 text-left"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm text-foreground truncate">{f.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{examCount} exams · {subCount} folders</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}

            {/* Exams */}
            {currentExams.length === 0 && subFolders.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-heading font-semibold text-foreground">No exams here</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
              </div>
            ) : currentExams.map((exam, i) => {
              const locked = !isApproved;
              return (
                <Link
                  key={exam.id}
                  to={locked ? "#" : (user ? `/exam/${exam.id}` : "/auth")}
                  onClick={(e) => locked ? handleExamClick(e) : undefined}
                  className={`animate-slide-up block bg-card rounded-2xl p-4 shadow-card border border-border/50 transition-all ${locked ? "opacity-80" : "hover:shadow-card-hover hover:-translate-y-0.5"}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${locked ? "bg-muted" : "gradient-primary"}`}>
                      {locked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <FileText className="h-5 w-5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm text-foreground truncate">{exam.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {exam.duration_minutes} min</span>
                        <span className="text-xs text-muted-foreground">{exam.total_marks} Q</span>
                      </div>
                    </div>
                    {locked ? (
                      <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Lock className="h-3 w-3" /> Premium</span>
                    ) : (
                      <span className="gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Start</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
