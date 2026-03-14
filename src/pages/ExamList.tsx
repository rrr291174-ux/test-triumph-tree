import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApproval } from "@/hooks/useApproval";
import { ArrowLeft, FileText, Clock, Loader2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks: number;
  created_at: string;
}

export default function ExamList() {
  const { subjectSlug } = useParams();
  const { user } = useAuth();
  const { isApproved } = useApproval();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: subject } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("slug", subjectSlug)
        .maybeSingle();

      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      const { data: examsData } = await supabase
        .from("exams")
        .select("id, title, duration_minutes, total_marks, created_at")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setExams(examsData || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug]);

  const handleExamClick = (e: React.MouseEvent, examId: string) => {
    if (!user) { navigate("/auth"); return; }
    if (!isApproved) {
      e.preventDefault();
      toast({ title: "🔒 Premium Content", description: "Admin approval needed. Contact admin to unlock." });
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={`/subject/${subjectSlug}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName} Exams</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{exams.length} exams available</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : exams.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">No exams yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        ) : (
          exams.map((exam, i) => {
            const locked = !isApproved;
            return (
              <Link
                key={exam.id}
                to={locked ? "#" : (user ? `/exam/${exam.id}` : "/auth")}
                onClick={(e) => locked ? handleExamClick(e, exam.id) : undefined}
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
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {exam.duration_minutes} min
                      </span>
                      <span className="text-xs text-muted-foreground">{exam.total_marks} Q</span>
                    </div>
                  </div>
                  {locked ? (
                    <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Premium
                    </span>
                  ) : (
                    <span className="gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Start</span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
