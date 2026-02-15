import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  answer_index: number;
  display_order: number;
}

interface ExamInfo {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks: number;
}

export default function ExamTake() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchExam = async () => {
      const { data: examData } = await supabase
        .from("exams")
        .select("id, title, duration_minutes, total_marks")
        .eq("id", examId)
        .maybeSingle();

      if (!examData) {
        toast({ title: "Exam not found", variant: "destructive" });
        navigate("/");
        return;
      }

      const { data: qData } = await supabase
        .from("questions")
        .select("id, question_text, options, answer_index, display_order")
        .eq("exam_id", examId)
        .order("display_order");

      setExam(examData);
      const parsedQuestions = (qData || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as any),
      }));
      setQuestions(parsedQuestions);
      setTimeLeft(examData.duration_minutes * 60);
      setLoading(false);
    };
    fetchExam();
  }, [examId, user, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting || !user) return;
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    let correct = 0, wrong = 0, unanswered = 0;
    const answerDetails: { question_id: string; selected_index: number | null; is_correct: boolean }[] = [];

    questions.forEach((q) => {
      const selected = answers[q.id] ?? null;
      const isCorrect = selected === q.answer_index;
      if (selected === null) unanswered++;
      else if (isCorrect) correct++;
      else wrong++;
      answerDetails.push({ question_id: q.id, selected_index: selected, is_correct: isCorrect });
    });

    const { data: attempt, error } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        exam_id: examId!,
        score: correct,
        total_questions: questions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
        time_taken_seconds: timeTaken,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      toast({ title: "Submit failed", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("attempt_answers").insert(
      answerDetails.map((a) => ({
        attempt_id: attempt.id,
        question_id: a.question_id,
        selected_index: a.selected_index,
        is_correct: a.is_correct,
      }))
    );

    navigate(`/exam-result/${attempt.id}`);
  }, [answers, questions, submitting, user, examId, startTime, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || loading) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, handleSubmit, timeLeft]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!questions.length) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">No questions found</div>;

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Timer bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="font-heading font-bold text-sm text-foreground truncate flex-1">{exam?.title}</div>
        <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"}`}>
          <Clock className="h-4 w-4" />
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{answered}/{questions.length} answered</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="gradient-primary h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-4">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-4">
          <p className="font-semibold text-base text-foreground whitespace-pre-wrap leading-relaxed">{q.question_text}</p>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/10 shadow-primary scale-[1.01]"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    selected ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-foreground pt-1">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
          disabled={currentQ === 0}
          className="rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex gap-1 overflow-x-auto py-1 justify-center">
          {questions.map((qq, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                i === currentQ
                  ? "gradient-primary text-primary-foreground scale-110"
                  : answers[qq.id] !== undefined
                  ? "bg-accent/20 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ((c) => c + 1)} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl gap-1 bg-accent hover:bg-accent/90">
            <Flag className="h-4 w-4" />
            {submitting ? "..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
