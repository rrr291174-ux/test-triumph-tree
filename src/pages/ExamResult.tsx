import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, Minus, ArrowLeft, Trophy, Target, Clock, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AttemptData {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  time_taken_seconds: number;
  exam_id: string;
}

interface AnswerDetail {
  id: string;
  question_id: string;
  selected_index: number | null;
  is_correct: boolean;
  question: {
    question_text: string;
    options: string[];
    answer_index: number;
  };
}

export default function ExamResult() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchData = async () => {
      const { data: att } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("id", attemptId)
        .maybeSingle();

      if (!att) { setLoading(false); return; }
      setAttempt(att);

      const { data: examData } = await supabase
        .from("exams")
        .select("title")
        .eq("id", att.exam_id)
        .maybeSingle();
      setExamTitle(examData?.title || "Exam");

      const { data: ansData } = await supabase
        .from("attempt_answers")
        .select("id, question_id, selected_index, is_correct")
        .eq("attempt_id", attemptId);

      if (ansData) {
        const questionIds = ansData.map(a => a.question_id);
        const { data: qData } = await supabase
          .from("questions")
          .select("id, question_text, options, answer_index")
          .in("id", questionIds);

        const qMap = new Map((qData || []).map(q => [q.id, q]));
        const merged = ansData.map(a => ({
          ...a,
          question: {
            question_text: qMap.get(a.question_id)?.question_text || "",
            options: (Array.isArray(qMap.get(a.question_id)?.options) 
              ? qMap.get(a.question_id)?.options 
              : JSON.parse(qMap.get(a.question_id)?.options as any || "[]")) as string[],
            answer_index: qMap.get(a.question_id)?.answer_index || 0,
          }
        }));
        setAnswers(merged);
      }
      setLoading(false);
    };
    fetchData();
  }, [attemptId, user, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!attempt) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Result not found</div>;

  const accuracy = attempt.total_questions > 0 ? Math.round((attempt.correct_answers / attempt.total_questions) * 100) : 0;
  const mins = Math.floor(attempt.time_taken_seconds / 60);
  const secs = attempt.time_taken_seconds % 60;

  const pieData = [
    { name: "Correct", value: attempt.correct_answers, color: "hsl(142, 64%, 45%)" },
    { name: "Wrong", value: attempt.wrong_answers, color: "hsl(0, 84%, 60%)" },
    { name: "Unanswered", value: attempt.unanswered, color: "hsl(220, 20%, 80%)" },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3 float-left">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="clear-both" />
        <Trophy className="h-12 w-12 text-primary-foreground mx-auto mb-2" />
        <h1 className="font-heading font-extrabold text-3xl text-primary-foreground">{accuracy}%</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">{examTitle}</p>
      </div>

      <div className="px-4 -mt-6 grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-center">
          <Target className="h-5 w-5 text-accent mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-foreground">{attempt.score}/{attempt.total_questions}</div>
          <div className="text-[10px] text-muted-foreground">Score</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-center">
          <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-foreground">{mins}m {secs}s</div>
          <div className="text-[10px] text-muted-foreground">Time Taken</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-center">
          <CheckCircle className="h-5 w-5 text-accent mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-accent">{attempt.correct_answers}</div>
          <div className="text-[10px] text-muted-foreground">Correct</div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 text-center">
          <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
          <div className="font-heading font-bold text-xl text-destructive">{attempt.wrong_answers}</div>
          <div className="text-[10px] text-muted-foreground">Wrong</div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-sm mb-2 text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Performance Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full bg-card rounded-2xl p-4 shadow-card border border-border/50 font-heading font-semibold text-sm text-primary text-center hover:shadow-card-hover transition-all"
        >
          {showReview ? "Hide" : "Show"} Detailed Review 📋
        </button>
      </div>

      {showReview && (
        <div className="px-4 mt-4 space-y-3">
          {answers.map((a, i) => (
            <div key={a.id} className={`bg-card rounded-2xl p-4 shadow-card border-2 ${a.is_correct ? "border-accent/30" : a.selected_index === null ? "border-border/50" : "border-destructive/30"}`}>
              <div className="flex items-start gap-2 mb-2">
                {a.is_correct ? <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" /> : a.selected_index === null ? <Minus className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />}
                <p className="text-sm font-semibold text-foreground whitespace-pre-wrap">Q{i + 1}: {a.question.question_text}</p>
              </div>
              <div className="space-y-1.5 ml-7">
                {a.question.options.map((opt, j) => {
                  const isCorrectOpt = j === a.question.answer_index;
                  const isSelected = j === a.selected_index;
                  return (
                    <div key={j} className={`px-3 py-1.5 rounded-lg text-xs ${
                      isCorrectOpt ? "bg-accent/15 text-accent font-bold" :
                      isSelected ? "bg-destructive/15 text-destructive" :
                      "bg-muted/50 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + j)}. {opt}
                      {isCorrectOpt && " ✓"}
                      {isSelected && !isCorrectOpt && " ✗"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
