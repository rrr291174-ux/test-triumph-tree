import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Clock, BookOpen, CheckCircle, X, AlertTriangle } from "lucide-react";
import ObjectionModal from "@/components/ObjectionModal";

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

type QState = "unvisited" | "not-answered" | "answered" | "marked" | "answered-marked";

// Palette shapes — cycling like the bot: shield, circle, hex
const SHAPES = ["shield", "circle", "hex"];

function getPaletteCls(state: QState, isCurrent: boolean, shapeIdx: number): string {
  const shape = SHAPES[shapeIdx % SHAPES.length];
  let color = "";
  switch (state) {
    case "answered":        color = "from-green-500 to-green-700"; break;
    case "not-answered":    color = "from-red-500 to-orange-500"; break;
    case "marked":          color = "from-cyan-400 to-cyan-600"; break;
    case "answered-marked": color = "from-green-500 to-cyan-500"; break;
    default:                color = "from-gray-400 to-gray-600"; break;
  }
  const ring = isCurrent ? " outline outline-[3px] outline-violet-400 outline-offset-1" : "";
  const base = `w-12 h-10 flex items-center justify-center font-extrabold text-xs text-white bg-gradient-to-b ${color} transition-all active:scale-90 cursor-pointer${ring}`;
  if (shape === "circle") return `${base} rounded-full w-11 h-11`;
  if (shape === "hex")    return `${base} rounded-xl`; // approximate hex with rounded
  // shield
  return `${base} rounded-t-xl rounded-b-sm`;
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [objectionOpen, setObjectionOpen] = useState(false);

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
      const parsed = (qData || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as any),
      }));
      setQuestions(parsed);
      setTimeLeft(examData.duration_minutes * 60);
      setLoading(false);
    };
    fetchExam();
  }, [examId, user, navigate]);

  const goTo = useCallback((i: number) => {
    setVisited(prev => { const n = new Set(prev); n.add(i); return n; });
    setCurrentQ(i);
  }, []);

  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto) { setShowSubmitConfirm(true); return; }
    if (submitting || !user) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    let correct = 0, wrong = 0, unanswered = 0;
    const details: { question_id: string; selected_index: number | null; is_correct: boolean }[] = [];

    questions.forEach(q => {
      const sel = answers[q.id] ?? null;
      const ok = sel === q.answer_index;
      if (sel === null) unanswered++; else if (ok) correct++; else wrong++;
      details.push({ question_id: q.id, selected_index: sel, is_correct: ok });
    });

    const { data: attempt, error } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id, exam_id: examId!,
        score: correct, total_questions: questions.length,
        correct_answers: correct, wrong_answers: wrong,
        unanswered, time_taken_seconds: timeTaken,
        completed_at: new Date().toISOString(),
      })
      .select("id").single();

    if (error) {
      toast({ title: "Submit failed", description: error.message, variant: "destructive" });
      setSubmitting(false); return;
    }

    await supabase.from("attempt_answers").insert(
      details.map(a => ({ attempt_id: attempt.id, ...a }))
    );
    navigate(`/exam-result/${attempt.id}`);
  }, [answers, questions, submitting, user, examId, startTime, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || loading) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, handleSubmit, timeLeft]);

  function getQState(i: number): QState {
    const q = questions[i];
    if (!q) return "unvisited";
    const hasAns = answers[q.id] != null;
    const isMark = marked.has(i);
    if (isMark && hasAns) return "answered-marked";
    if (isMark) return "marked";
    if (hasAns) return "answered";
    if (visited.has(i)) return "not-answered";
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
  const answeredCount = Object.values(answers).filter(v => v != null).length;
  const isLow = timeLeft < 60;
  const isWarn = timeLeft < 300;
  const isMarked = marked.has(currentQ);
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        {/* Brand row */}
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground truncate">{exam?.title}</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono font-extrabold text-lg shrink-0 ${
            isLow ? "bg-red-500 text-white animate-pulse" :
            isWarn ? "bg-orange-100 text-orange-600 border border-orange-300" :
            "bg-gradient-to-r from-green-500 to-blue-500 text-white"
          }`}>
            <Clock className="h-4 w-4" />
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
        </div>

        {/* Stats + buttons row */}
        <div className="flex items-center gap-2 px-3 pb-2">
          <span className="text-sm font-bold bg-blue-500 text-white px-4 py-1.5 rounded-full">
            {answeredCount} / {questions.length} Answered
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-sm font-bold px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition-all"
          >
            ☰ Palette
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── QUESTION ── */}
      <div className="flex-1 px-4 pt-4 pb-2 overflow-y-auto">
        {/* Q number */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="gradient-primary text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-primary">
            Q {currentQ + 1} of {questions.length}
          </span>
          {answers[q.id] != null && (
            <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Answered
            </span>
          )}
          {isMarked && (
            <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-full">
              🔖 Marked for Review
            </span>
          )}
        </div>

        {/* Question text */}
        <div className="rounded-2xl p-5 mb-4 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 shadow-lg">
          <p className="font-extrabold text-3xl text-white whitespace-pre-wrap leading-relaxed tracking-tight">
            {q.question_text}
          </p>
        </div>

        {/* Objection button */}
        <button
          onClick={() => setObjectionOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full mb-4 hover:bg-orange-100 transition-all active:scale-95"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Raise Objection
        </button>

        {/* Options — (a) (b) (c) (d) style */}
        <div className="space-y-3">
        {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            const badgeColors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-violet-500"];
            return (
              <button
                key={i}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                className={`w-full text-left rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] ${
                  selected
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 border-transparent shadow-lg"
                    : "border-border bg-card hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    selected ? "bg-white/20 text-white" : `${badgeColors[i % 4]} text-white`
                  }`}>
                    {String.fromCharCode(97 + i)}
                  </span>
                  <span className={`text-2xl font-bold leading-snug ${selected ? "text-white" : "text-foreground"}`}>
                    {opt}
                  </span>
                  {selected && <CheckCircle className="h-5 w-5 text-white ml-auto shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR — 4 buttons always visible like bot ── */}
      <div className="sticky bottom-0 z-30 bg-card border-t-2 border-border px-3 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.10)]">
        <div className="flex items-stretch gap-2">

          {/* ◀ Previous */}
          <button
            onClick={() => goTo(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="flex-1 flex items-center justify-center gap-1 h-14 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          >
            ◀ Prev
          </button>

          {/* ✳ Mark for Review */}
          <button
            onClick={() => setMarked(prev => {
              const n = new Set(prev);
              if (n.has(currentQ)) n.delete(currentQ); else n.add(currentQ);
              return n;
            })}
            className={`flex-1 flex items-center justify-center gap-1 h-14 rounded-2xl font-bold text-sm text-white shadow active:scale-95 transition-all ${
              isMarked
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 opacity-90"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
          >
            {isMarked ? "✳ Marked" : "✳ Mark"}
          </button>

          {/* Next ▶ */}
          <button
            onClick={() => goTo(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            className="flex-1 flex items-center justify-center gap-1 h-14 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Next ▶
          </button>

          {/* Submit */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center h-14 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </button>
        </div>
      </div>

      {/* ── PALETTE DRAWER (right side) ── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[88vw] bg-card border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Drawer header */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <span className="font-heading font-bold text-base text-foreground">Question Palette</span>
          <div className="flex-1" />
          <div className={`font-mono font-extrabold text-base px-3 py-1 rounded-xl ${
            isLow ? "bg-red-500 text-white" : "bg-gradient-to-r from-green-500 to-blue-500 text-white"
          }`}>
            {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
          </div>
          <button onClick={() => setDrawerOpen(false)} className="ml-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5 border-b border-border">
          {[
            { cls: "bg-green-600", label: "Answered" },
            { cls: "bg-red-500", label: "Not Answered" },
            { cls: "bg-gray-500", label: "Not Visited" },
            { cls: "bg-cyan-500", label: "Marked" },
            { cls: "bg-gradient-to-r from-green-500 to-cyan-500", label: "Ans+Mark" },
          ].map(l => (
            <span key={l.label} className={`inline-flex items-center gap-1.5 text-[10px] font-bold text-white px-2 py-1 rounded-full ${l.cls}`}>
              {l.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const state = getQState(i);
              const isCurr = i === currentQ;
              return (
                <button
                  key={i}
                  onClick={() => { goTo(i); setDrawerOpen(false); }}
                  className={getPaletteCls(state, isCurr, i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit from drawer */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => { setDrawerOpen(false); setShowSubmitConfirm(true); }}
            className="w-full h-12 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow active:scale-95 transition-all"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      {/* ── SUBMIT CONFIRMATION ── */}
      {/* Objection Modal */}
      <ObjectionModal
        open={objectionOpen}
        onClose={() => setObjectionOpen(false)}
        questionId={q.id}
        examId={examId!}
        questionNumber={currentQ + 1}
        questionText={q.question_text}
      />

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-foreground">Submit Quiz?</h3>
              <button onClick={() => setShowSubmitConfirm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-200">
                <div className="font-heading font-bold text-2xl text-green-600">{answeredCount}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Answered</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-200">
                <div className="font-heading font-bold text-2xl text-red-500">{questions.length - answeredCount}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Unanswered</div>
              </div>
              <div className="bg-cyan-50 rounded-2xl p-3 text-center border border-cyan-200">
                <div className="font-heading font-bold text-2xl text-cyan-600">{marked.size}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Marked</div>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-2 mb-4 font-medium border border-orange-200">
                ⚠️ {questions.length - answeredCount} questions still unanswered!
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 h-12 rounded-2xl border-2 border-border text-foreground font-bold text-sm hover:bg-muted/50 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm shadow active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "✓ Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
