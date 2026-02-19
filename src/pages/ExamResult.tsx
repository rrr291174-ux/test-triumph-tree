import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, CheckCircle, XCircle, Minus, ArrowLeft,
  Trophy, Target, Clock, BookOpen, Star, ChevronDown, ChevronUp, Home, RotateCcw
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
  if (accuracy >= 90) return { label: "Excellent! 🎉", color: "text-accent", emoji: "🏆" };
  if (accuracy >= 75) return { label: "Great Job! 👍", color: "text-secondary", emoji: "🌟" };
  if (accuracy >= 60) return { label: "Good Effort!", color: "text-primary", emoji: "💪" };
  if (accuracy >= 40) return { label: "Keep Practicing", color: "text-orange-500", emoji: "📚" };
  return { label: "Don't Give Up!", color: "text-destructive", emoji: "🔥" };
}

export default function ExamResult() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<AnswerDetail[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [examId, setExamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
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
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-primary animate-pulse">
        <Trophy className="h-8 w-8 text-white" />
      </div>
      <p className="text-muted-foreground font-medium">Loading results...</p>
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

  // Circumference for circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (accuracy / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Hero Header */}
      <div className="relative gradient-hero overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-10 -translate-x-6" />

        <div className="relative px-4 pt-5 pb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="text-center mt-2">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">{examTitle}</p>
            <h1 className="font-heading font-extrabold text-2xl text-white mb-1">{grade.label}</h1>
            <p className="text-white/60 text-xs">Your performance summary</p>
          </div>
        </div>
      </div>

      {/* Circular Score Card — floating over hero */}
      <div className="px-4 -mt-10 mb-4">
        <div className="bg-card rounded-3xl shadow-[0_8px_40px_-8px_hsl(220_40%_13%/0.18)] border border-border/50 p-6">
          <div className="flex items-center justify-center gap-8">

            {/* Circular Progress */}
            <div className="relative flex-shrink-0">
              <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                {/* Background circle */}
                <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="10"
                  stroke="hsl(var(--muted))" />
                {/* Progress arc */}
                <circle cx="66" cy="66" r={radius} fill="none" strokeWidth="10"
                  stroke={accuracy >= 75 ? "hsl(var(--accent))" : accuracy >= 50 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl">{grade.emoji}</span>
                <span className="font-heading font-extrabold text-2xl text-foreground leading-none">{accuracy}%</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Accuracy</span>
              </div>
            </div>

            {/* Score details */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="font-heading font-bold text-lg text-foreground leading-none">{attempt.score}/{attempt.total_questions}</div>
                  <div className="text-[10px] text-muted-foreground">Score</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <div className="font-heading font-bold text-lg text-foreground leading-none">{mins}m {secs}s</div>
                  <div className="text-[10px] text-muted-foreground">Time Taken</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-heading font-bold text-lg text-foreground leading-none">{attempt.total_questions}</div>
                  <div className="text-[10px] text-muted-foreground">Total Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar — Correct / Wrong / Unanswered */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
          {/* Visual bar */}
          <div className="h-3 flex w-full">
            {attempt.correct_answers > 0 && (
              <div className="bg-accent transition-all" style={{ width: `${(attempt.correct_answers / attempt.total_questions) * 100}%` }} />
            )}
            {attempt.wrong_answers > 0 && (
              <div className="bg-destructive transition-all" style={{ width: `${(attempt.wrong_answers / attempt.total_questions) * 100}%` }} />
            )}
            {attempt.unanswered > 0 && (
              <div className="bg-muted transition-all" style={{ width: `${(attempt.unanswered / attempt.total_questions) * 100}%` }} />
            )}
          </div>

          {/* Labels */}
          <div className="grid grid-cols-3 divide-x divide-border/50 p-0">
            {/* Correct */}
            <div className="flex flex-col items-center py-4 gap-1">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-accent" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-accent">{attempt.correct_answers}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Correct</span>
            </div>

            {/* Wrong */}
            <div className="flex flex-col items-center py-4 gap-1">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-destructive">{attempt.wrong_answers}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Wrong</span>
            </div>

            {/* Unanswered */}
            <div className="flex flex-col items-center py-4 gap-1">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-1">
                <Minus className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-heading font-extrabold text-2xl text-muted-foreground">{attempt.unanswered}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Skipped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="px-4 mb-4">
        <div className={`rounded-2xl px-4 py-3 border ${
          accuracy >= 75 ? "bg-accent/8 border-accent/20" :
          accuracy >= 50 ? "bg-primary/8 border-primary/20" :
          "bg-destructive/8 border-destructive/20"
        }`}>
          <p className={`text-sm font-semibold text-center ${grade.color}`}>
            {accuracy >= 90 && "Outstanding! You've mastered this topic. Keep it up! 🎯"}
            {accuracy >= 75 && accuracy < 90 && "Great performance! A little more practice and you'll ace it! 🌟"}
            {accuracy >= 60 && accuracy < 75 && "Good work! Review the wrong answers and try again. 💪"}
            {accuracy >= 40 && accuracy < 60 && "You're making progress! Focus on weak areas. 📚"}
            {accuracy < 40 && "Keep going! Every attempt makes you stronger. Revise and retry! 🔥"}
          </p>
        </div>
      </div>

      {/* Detailed Review Toggle */}
      <div className="px-4 mb-3">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full gradient-primary text-white rounded-2xl py-4 font-heading font-bold text-base flex items-center justify-center gap-2 shadow-primary active:scale-[0.98] transition-all"
        >
          <Target className="h-5 w-5" />
          {showReview ? "Hide" : "View"} Detailed Review
          {showReview ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Question-wise Review */}
      {showReview && (
        <div className="px-4 space-y-3">
          {answers.map((a, i) => {
            const isExpanded = expandedQ === a.id;
            const statusColor = a.is_correct
              ? "border-accent/40 bg-accent/5"
              : a.selected_index === null
              ? "border-muted bg-muted/30"
              : "border-destructive/40 bg-destructive/5";

            return (
              <div key={a.id} className={`rounded-2xl border-2 overflow-hidden transition-all ${statusColor}`}>
                {/* Question Header */}
                <button
                  className="w-full text-left p-4"
                  onClick={() => setExpandedQ(isExpanded ? null : a.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      a.is_correct ? "bg-accent text-white" :
                      a.selected_index === null ? "bg-muted-foreground/20 text-muted-foreground" :
                      "bg-destructive text-white"
                    }`}>
                      {a.is_correct
                        ? <CheckCircle className="h-4 w-4" />
                        : a.selected_index === null
                        ? <Minus className="h-4 w-4" />
                        : <XCircle className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Q{i + 1}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.is_correct ? "bg-accent/15 text-accent" :
                          a.selected_index === null ? "bg-muted text-muted-foreground" :
                          "bg-destructive/15 text-destructive"
                        }`}>
                          {a.is_correct ? "Correct" : a.selected_index === null ? "Skipped" : "Wrong"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {a.question.question_text}
                      </p>
                    </div>

                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Options */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
                    {a.question.options.map((opt, j) => {
                      const isCorrectOpt = j === a.question.answer_index;
                      const isSelectedOpt = j === a.selected_index;
                      const isWrongSelected = isSelectedOpt && !isCorrectOpt;

                      return (
                        <div key={j} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isCorrectOpt
                            ? "bg-accent text-white shadow-sm"
                            : isWrongSelected
                            ? "bg-destructive text-white shadow-sm"
                            : "bg-card/80 text-muted-foreground border border-border/40"
                        }`}>
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCorrectOpt ? "bg-white/20" :
                            isWrongSelected ? "bg-white/20" :
                            "bg-muted"
                          }`}>
                            {String.fromCharCode(65 + j)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isCorrectOpt && <CheckCircle className="h-4 w-4 shrink-0" />}
                          {isWrongSelected && <XCircle className="h-4 w-4 shrink-0" />}
                        </div>
                      );
                    })}

                    {/* Explanation if available */}
                    {a.question.explanation && (
                      <div className="mt-2 px-3 py-2.5 bg-secondary/10 rounded-xl border border-secondary/20">
                        <p className="text-xs text-secondary font-semibold mb-0.5">💡 Explanation</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 h-13 py-3.5 rounded-2xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all active:scale-95"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        {examId && (
          <Link
            to={`/exam/${examId}`}
            className="flex-1 flex items-center justify-center gap-2 h-13 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-primary active:scale-95 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Exam
          </Link>
        )}
      </div>
    </div>
  );
}
