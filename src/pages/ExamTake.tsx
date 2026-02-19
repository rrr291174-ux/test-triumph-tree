import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Clock, ChevronLeft, ChevronRight, Flag, BookOpen, CheckCircle } from "lucide-react";
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

const OPTION_COLORS = [
  { border: "border-blue-400", bg: "bg-blue-50", selectedBg: "bg-blue-500", label: "bg-blue-400", text: "text-blue-700" },
  { border: "border-violet-400", bg: "bg-violet-50", selectedBg: "bg-violet-500", label: "bg-violet-400", text: "text-violet-700" },
  { border: "border-emerald-400", bg: "bg-emerald-50", selectedBg: "bg-emerald-500", label: "bg-emerald-400", text: "text-emerald-700" },
  { border: "border-orange-400", bg: "bg-orange-50", selectedBg: "bg-orange-500", label: "bg-orange-400", text: "text-orange-700" },
];

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
  const [showPalette, setShowPalette] = useState(false);

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
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, handleSubmit, timeLeft]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-primary animate-pulse">
        <BookOpen className="h-8 w-8 text-white" />
      </div>
      <p className="text-muted-foreground font-medium">Loading exam...</p>
    </div>
  );

  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">No questions found</div>
  );

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const answered = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const progress = ((currentQ + 1) / questions.length) * 100;
  const isLowTime = timeLeft < 60;
  const isWarningTime = timeLeft < 300;

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top Bar */}
      <div className={`sticky top-0 z-50 border-b px-4 py-3 ${isLowTime ? "bg-destructive/5 border-destructive/30" : "bg-card border-border"}`}>
        <div className="flex items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground truncate">{exam?.title}</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm shrink-0 ${
            isLowTime
              ? "bg-destructive text-white animate-pulse shadow-lg"
              : isWarningTime
              ? "bg-orange-100 text-orange-600 border border-orange-300"
              : "bg-primary/10 text-primary border border-primary/20"
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-medium">
          <span>Q {currentQ + 1} / {questions.length}</span>
          <span className="text-accent font-semibold">{answered} answered ✓</span>
          <span>{questions.length - answered} remaining</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-4 pt-4 pb-2 overflow-y-auto">
        {/* Question number badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-primary">
            Question {currentQ + 1}
          </span>
          {answers[q.id] !== undefined && (
            <span className="bg-accent/15 text-accent text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Answered
            </span>
          )}
        </div>

        {/* Question text */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-4">
          <p className="font-semibold text-base text-foreground whitespace-pre-wrap leading-relaxed">
            {q.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            const color = OPTION_COLORS[i % OPTION_COLORS.length];

            return (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                className={`w-full text-left rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                  selected
                    ? `${color.selectedBg} border-transparent shadow-lg scale-[1.01]`
                    : `${color.bg} ${color.border} hover:scale-[1.01] hover:shadow-md`
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Option label */}
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white ${
                    selected ? "bg-white/25" : color.label
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {/* Option text */}
                  <span className={`text-sm font-medium leading-snug ${
                    selected ? "text-white" : color.text
                  }`}>
                    {opt}
                  </span>
                  {/* Selected indicator */}
                  {selected && (
                    <CheckCircle className="h-5 w-5 text-white ml-auto shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3 space-y-3">
        {/* Question palette toggle */}
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="w-full text-center text-xs text-muted-foreground font-medium py-1 hover:text-primary transition-colors"
        >
          {showPalette ? "▲ Hide" : "▼ Question Palette"}
        </button>

        {showPalette && (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
            {questions.map((qq, i) => (
              <button
                key={i}
                onClick={() => { setCurrentQ(i); setShowPalette(false); }}
                className={`w-8 h-8 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                  i === currentQ
                    ? "gradient-primary text-white scale-110 shadow-primary"
                    : answers[qq.id] !== undefined
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Prev / Next / Submit */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
            disabled={currentQ === 0}
            className="rounded-xl h-12 px-5 font-semibold border-2"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          <div className="flex-1" />

          {currentQ < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQ((c) => c + 1)}
              className="rounded-xl h-12 px-6 font-bold gradient-primary border-0 shadow-primary"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl h-12 px-6 font-bold bg-accent hover:bg-accent/90 text-white border-0 shadow-lg gap-2"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                : <><Flag className="h-4 w-4" /> Submit Exam</>
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
