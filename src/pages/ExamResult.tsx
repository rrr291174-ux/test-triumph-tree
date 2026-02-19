import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, CheckCircle, XCircle, Minus, Trophy, Target,
  Clock, BookOpen, Star, ChevronDown, ChevronUp, Home, RotateCcw
} from "lucide-react";

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
    explanation?: string;
  };
}

function getGrade(accuracy: number) {
  if (accuracy >= 90) return { label: "Excellent! 🎉", bg: "from-green-500 via-emerald-500 to-teal-500", emoji: "🏆" };
  if (accuracy >= 75) return { label: "Great Job! 👍", bg: "from-blue-500 via-indigo-500 to-violet-500", emoji: "🌟" };
  if (accuracy >= 60) return { label: "Good Effort! 💪", bg: "from-violet-500 via-purple-500 to-indigo-500", emoji: "💪" };
  if (accuracy >= 40) return { label: "Keep Practicing 📚", bg: "from-orange-500 via-amber-500 to-yellow-500", emoji: "📚" };
  return { label: "Don't Give Up! 🔥", bg: "from-red-500 via-orange-500 to-amber-500", emoji: "🔥" };
}

const OPTION_COLORS = [
  { bg: "from-blue-500 to-blue-600", light: "bg-blue-50 border-blue-200 text-blue-700", badge: "bg-blue-500" },
  { bg: "from-emerald-500 to-green-600", light: "bg-emerald-50 border-emerald-200 text-emerald-700", badge: "bg-emerald-500" },
  { bg: "from-orange-500 to-amber-500", light: "bg-orange-50 border-orange-200 text-orange-700", badge: "bg-orange-500" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 border-violet-200 text-violet-700", badge: "bg-violet-500" },
];

export default function ExamResult() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

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
        .select("title, id")
        .eq("id", att.exam_id)
        .maybeSingle();
      setExamTitle(examData?.title || "Exam");
      setExamId(examData?.id || "");

      const { data: ansData } = await supabase
        .from("attempt_answers")
        .select("id, question_id, selected_index, is_correct")
        .eq("attempt_id", attemptId);

      if (ansData) {
        const questionIds = ansData.map(a => a.question_id);
        const { data: qData } = await supabase
          .from("questions")
          .select("id, question_text, options, answer_index, explanation")
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
            explanation: qMap.get(a.question_id)?.explanation || "",
          }
        }));
        setAnswers(merged);
      }
      setLoading(false);
    };
    fetchData();
  }, [attemptId, user, navigate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center animate-pulse shadow-lg">
        <Trophy className="h-8 w-8 text-white" />
      </div>
      <p className="text-muted-foreground font-semibold">Loading results...</p>
    </div>
  );

  if (!attempt) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">Result not found</div>
  );

  const accuracy = attempt.total_questions > 0
    ? Math.round((attempt.correct_answers / attempt.total_questions) * 100)
    : 0;
  const mins = Math.floor(attempt.time_taken_seconds / 60);
  const secs = attempt.time_taken_seconds % 60;
  const grade = getGrade(accuracy);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (accuracy / 100) * circumference;
  const ringColor = accuracy >= 75 ? "#22c55e" : accuracy >= 50 ? "#f97316" : "#ef4444";

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── HERO BANNER ── */}
      <div className={`bg-gradient-to-br ${grade.bg} px-4 pt-10 pb-20 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/10 translate-y-8 -translate-x-8" />
        <div className="relative text-center">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{examTitle}</p>
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <h1 className="font-extrabold text-3xl text-white mb-1">{grade.label}</h1>
          <p className="text-white/70 text-sm">Your performance summary</p>
        </div>
      </div>

      {/* ── SCORE CARD — floats over hero ── */}
      <div className="px-4 -mt-12 mb-4">
        <div className="bg-card rounded-3xl shadow-2xl border border-border/40 p-5">
          <div className="flex items-center gap-6">

            {/* Circular accuracy ring */}
            <div className="relative shrink-0">
              <svg width="120" height="120" viewBox="0 0 132 132" className="-rotate-90">
                <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="10" stroke="hsl(var(--muted))" />
                <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="10"
                  stroke={ringColor} strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-2xl text-foreground leading-none">{accuracy}%</span>
                <span className="text-[10px] text-muted-foreground font-bold">Accuracy</span>
              </div>
            </div>

            {/* Stats column */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="font-extrabold text-xl text-foreground leading-none">{attempt.score}/{attempt.total_questions}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Score</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-extrabold text-xl text-foreground leading-none">{mins}m {secs}s</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Time Taken</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="font-extrabold text-xl text-foreground leading-none">{attempt.total_questions}</div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Total Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CORRECT / WRONG / SKIPPED ── */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500 rounded-2xl p-4 text-center shadow-lg">
            <CheckCircle className="h-6 w-6 text-white mx-auto mb-1" />
            <div className="font-extrabold text-3xl text-white">{attempt.correct_answers}</div>
            <div className="text-white/80 text-xs font-bold mt-0.5">Correct</div>
          </div>
          <div className="bg-red-500 rounded-2xl p-4 text-center shadow-lg">
            <XCircle className="h-6 w-6 text-white mx-auto mb-1" />
            <div className="font-extrabold text-3xl text-white">{attempt.wrong_answers}</div>
            <div className="text-white/80 text-xs font-bold mt-0.5">Wrong</div>
          </div>
          <div className="bg-gray-500 rounded-2xl p-4 text-center shadow-lg">
            <Minus className="h-6 w-6 text-white mx-auto mb-1" />
            <div className="font-extrabold text-3xl text-white">{attempt.unanswered}</div>
            <div className="text-white/80 text-xs font-bold mt-0.5">Skipped</div>
          </div>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="px-4 mb-5">
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          {attempt.correct_answers > 0 && (
            <div className="bg-green-500 transition-all" style={{ width: `${(attempt.correct_answers / attempt.total_questions) * 100}%` }} />
          )}
          {attempt.wrong_answers > 0 && (
            <div className="bg-red-500 transition-all" style={{ width: `${(attempt.wrong_answers / attempt.total_questions) * 100}%` }} />
          )}
          {attempt.unanswered > 0 && (
            <div className="bg-gray-400 transition-all" style={{ width: `${(attempt.unanswered / attempt.total_questions) * 100}%` }} />
          )}
        </div>
      </div>

      {/* ── DETAILED REVIEW HEADER ── */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-violet-500" />
          <h2 className="font-extrabold text-xl text-foreground">Question Review</h2>
        </div>
      </div>

      {/* ── QUESTION-WISE REVIEW — always visible, colorful ── */}
      <div className="px-4 space-y-4">
        {answers.map((a, i) => {
          const isExpanded = expandedQ === a.id;
          const isCorrect = a.is_correct;
          const isSkipped = a.selected_index === null;

          const headerGrad = isCorrect
            ? "from-green-500 to-emerald-600"
            : isSkipped
            ? "from-gray-400 to-gray-500"
            : "from-red-500 to-rose-600";

          return (
            <div key={a.id} className="rounded-2xl overflow-hidden shadow-md border border-border/30">
              {/* Question header — colorful */}
              <button
                className={`w-full text-left bg-gradient-to-r ${headerGrad} px-4 py-4`}
                onClick={() => setExpandedQ(isExpanded ? null : a.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-extrabold text-white text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">
                        {isCorrect ? "✓ Correct" : isSkipped ? "— Skipped" : "✗ Wrong"}
                      </span>
                    </div>
                    <p className="text-white font-bold text-base leading-snug line-clamp-2">
                      {a.question.question_text}
                    </p>
                  </div>
                  <div className="shrink-0 text-white/80 mt-1">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </button>

              {/* Expanded Options */}
              {isExpanded && (
                <div className="bg-card px-4 py-4 space-y-2.5">
                  {a.question.options.map((opt, j) => {
                    const isCorrectOpt = j === a.question.answer_index;
                    const isSelectedOpt = j === a.selected_index;
                    const isWrongSelected = isSelectedOpt && !isCorrectOpt;
                    const c = OPTION_COLORS[j % OPTION_COLORS.length];

                    return (
                      <div key={j} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
                        isCorrectOpt
                          ? `bg-gradient-to-r ${c.bg} border-transparent shadow-md`
                          : isWrongSelected
                          ? "bg-red-500 border-red-600 shadow-md"
                          : `${c.light} border`
                      }`}>
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 ${
                          isCorrectOpt || isWrongSelected ? "bg-white/20 text-white" : `${c.badge} text-white`
                        }`}>
                          {String.fromCharCode(97 + j)}
                        </span>
                        <span className={`flex-1 font-bold text-sm leading-snug ${
                          isCorrectOpt || isWrongSelected ? "text-white" : ""
                        }`}>
                          {opt}
                        </span>
                        {isCorrectOpt && <CheckCircle className="h-5 w-5 text-white shrink-0" />}
                        {isWrongSelected && <XCircle className="h-5 w-5 text-white shrink-0" />}
                      </div>
                    );
                  })}

                  {/* Explanation */}
                  {a.question.explanation && (
                    <div className="mt-2 px-4 py-3 bg-violet-50 rounded-xl border border-violet-200">
                      <p className="text-xs font-extrabold text-violet-600 mb-1">💡 Explanation</p>
                      <p className="text-sm text-violet-800 leading-relaxed">{a.question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM ACTIONS ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-3 shadow-lg">
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 h-14 rounded-2xl border-2 border-border font-bold text-base text-foreground flex items-center justify-center gap-2 hover:bg-muted/50 transition-all active:scale-95"
          >
            <Home className="h-5 w-5" /> Home
          </button>
          <button
            onClick={() => navigate(`/exam/${examId}`)}
            className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <RotateCcw className="h-5 w-5" /> Retry Exam
          </button>
        </div>
      </div>
    </div>
  );
}
