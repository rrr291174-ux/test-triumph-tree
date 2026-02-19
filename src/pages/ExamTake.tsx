import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Clock, ChevronLeft, ChevronRight, Flag,
  BookOpen, CheckCircle, Bookmark, BookmarkCheck, X
} from "lucide-react";

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

// Question states (matching Telegram bot)
type QState = "unvisited" | "not-answered" | "answered" | "marked" | "answered-marked";

const OPTION_COLORS = [
  { border: "border-blue-400", bg: "bg-blue-50", selectedBg: "bg-blue-500", label: "bg-blue-400", text: "text-blue-700" },
  { border: "border-violet-400", bg: "bg-violet-50", selectedBg: "bg-violet-500", label: "bg-violet-400", text: "text-violet-700" },
  { border: "border-emerald-400", bg: "bg-emerald-50", selectedBg: "bg-emerald-500", label: "bg-emerald-400", text: "text-emerald-700" },
  { border: "border-orange-400", bg: "bg-orange-50", selectedBg: "bg-orange-500", label: "bg-orange-400", text: "text-orange-700" },
];

// Palette button state styles (matching bot colors)
function getPaletteStyle(state: QState, isCurrent: boolean): string {
  const base = "w-11 h-11 rounded-xl font-bold text-xs text-white transition-all active:scale-90 flex items-center justify-center shrink-0 relative";
  const current = isCurrent ? " ring-2 ring-violet-400 ring-offset-1 scale-110 shadow-lg" : "";
  switch (state) {
    case "answered":        return `${base} bg-gradient-to-b from-emerald-400 to-emerald-600${current}`;
    case "not-answered":    return `${base} bg-gradient-to-b from-red-400 to-red-600${current}`;
    case "marked":          return `${base} bg-gradient-to-b from-cyan-400 to-cyan-600${current}`;
    case "answered-marked": return `${base} bg-gradient-to-b from-emerald-400 to-cyan-500${current}`;
    default:                return `${base} bg-gradient-to-b from-gray-400 to-gray-500${current}`;
  }
}

export default function ExamTake() {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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

  // Mark current question as visited when navigating
  const goToQuestion = useCallback((index: number) => {
    setVisited(prev => { const n = new Set(prev); n.add(index); return n; });
    setCurrentQ(index);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting || !user) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);
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

  // Compute question state for palette
  function getQState(index: number): QState {
    const q = questions[index];
    if (!q) return "unvisited";
    const hasAns = answers[q.id] !== undefined && answers[q.id] !== null;
    const isMark = marked.has(index);
    if (isMark && hasAns) return "answered-marked";
    if (isMark) return "marked";
    if (hasAns) return "answered";
    if (visited.has(index)) return "not-answered";
    return "unvisited";
  }

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
  const isMarked = marked.has(currentQ);
  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;

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
          <span>{marked.size > 0 ? `${marked.size} marked 🔖` : `${questions.length - answered} remaining`}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-4 pt-4 pb-2 overflow-y-auto">
        {/* Question number badge + status */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="gradient-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-primary">
            Question {currentQ + 1}
          </span>
          {isAnswered && (
            <span className="bg-accent/15 text-accent text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Answered
            </span>
          )}
          {isMarked && (
            <span className="bg-cyan-100 text-cyan-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> Marked
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
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 text-white ${
                    selected ? "bg-white/25" : color.label
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-sm font-medium leading-snug ${
                    selected ? "text-white" : color.text
                  }`}>
                    {opt}
                  </span>
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
      <div className="sticky bottom-0 bg-card border-t-2 border-border px-4 pt-3 pb-5 space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">

        {/* Question palette toggle + legend */}
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="w-full text-center text-xs text-muted-foreground font-semibold py-1 hover:text-primary transition-colors flex items-center justify-center gap-1"
        >
          <span>{showPalette ? "▲ Hide Palette" : "▼ Question Palette"}</span>
        </button>

        {showPalette && (
          <div className="space-y-2">
            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 justify-center text-[10px] font-semibold">
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">● Answered</span>
              <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full">● Not Answered</span>
              <span className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">● Not Visited</span>
              <span className="flex items-center gap-1 bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">● Marked</span>
            </div>

            {/* Palette grid */}
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1 justify-start">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { goToQuestion(i); setShowPalette(false); }}
                  className={getPaletteStyle(getQState(i), i === currentQ)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons row */}
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => { goToQuestion(Math.max(0, currentQ - 1)); }}
            disabled={currentQ === 0}
            className={`flex items-center justify-center gap-1 h-14 px-4 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
              currentQ === 0
                ? "border-muted text-muted-foreground bg-muted/30 opacity-40 cursor-not-allowed"
                : "border-primary text-primary bg-primary/5 hover:bg-primary/10"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Prev</span>
          </button>

          {/* Mark for Review */}
          <button
            onClick={() => {
              setMarked(prev => {
                const n = new Set(prev);
                if (n.has(currentQ)) n.delete(currentQ); else n.add(currentQ);
                return n;
              });
            }}
            className={`flex items-center justify-center gap-1.5 h-14 px-3 rounded-2xl border-2 font-bold text-xs transition-all active:scale-95 ${
              isMarked
                ? "bg-cyan-500 border-cyan-500 text-white shadow-md"
                : "bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100"
            }`}
          >
            {isMarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            <span className="leading-tight">{isMarked ? "Marked" : "Mark"}</span>
          </button>

          <div className="flex-1" />

          {/* Next or Submit */}
          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => goToQuestion(currentQ + 1)}
              className="flex items-center justify-center gap-1 h-14 px-5 rounded-2xl font-bold text-sm text-white gradient-primary shadow-primary active:scale-95 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className="flex items-center justify-center gap-2 h-14 px-5 rounded-2xl font-bold text-sm text-white bg-accent hover:bg-accent/90 shadow-lg active:scale-95 transition-all disabled:opacity-60"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                : <><Flag className="h-4 w-4" /> Submit</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-6">
          <div className="bg-card rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-border/50 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-foreground">Submit Exam?</h3>
              <button onClick={() => setShowSubmitConfirm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-accent/10 rounded-2xl p-3 text-center">
                <div className="font-heading font-bold text-xl text-accent">{answered}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Answered</div>
              </div>
              <div className="bg-destructive/10 rounded-2xl p-3 text-center">
                <div className="font-heading font-bold text-xl text-destructive">{questions.length - answered}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Unanswered</div>
              </div>
              <div className="bg-cyan-50 rounded-2xl p-3 text-center">
                <div className="font-heading font-bold text-xl text-cyan-600">{marked.size}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Marked</div>
              </div>
            </div>

            {questions.length - answered > 0 && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-2 mb-4 font-medium">
                ⚠️ {questions.length - answered} questions unanswered. Sure you want to submit?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 h-13 py-3.5 rounded-2xl border-2 border-border text-foreground font-bold text-sm hover:bg-muted/50 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-13 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-primary active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Flag className="h-4 w-4" /> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
