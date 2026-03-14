import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useApproval } from "@/hooks/useApproval";
import { LockedContent } from "@/components/LockedContent";
import { ArrowLeft, FileText, Clock, Loader2 } from "lucide-react";

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
  const { isApproved, loading: approvalLoading } = useApproval();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Get subject
      const { data: subject } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("slug", subjectSlug)
        .maybeSingle();

      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      const { data: examsData, error } = await supabase
        .from("exams")
        .select("id, title, duration_minutes, total_marks, created_at")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      console.log("Exams fetched:", examsData, "Error:", error, "SubjectId:", subject.id);
      setExams(examsData || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug]);

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
          exams.map((exam, i) => (
            <Link
              key={exam.id}
              to={user ? `/exam/${exam.id}` : "/auth"}
              className="animate-slide-up block bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-foreground truncate">{exam.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {exam.duration_minutes} min
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exam.total_marks} Q
                    </span>
                  </div>
                </div>
                <span className="gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Start</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
