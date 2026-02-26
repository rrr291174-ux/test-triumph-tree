import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { X, AlertTriangle, Loader2, CheckCircle } from "lucide-react";

interface ObjectionModalProps {
  open: boolean;
  onClose: () => void;
  questionId: string;
  examId: string;
  questionNumber: number;
  questionText: string;
}

export default function ObjectionModal({
  open, onClose, questionId, examId, questionNumber, questionText
}: ObjectionModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<{ reason: string; status: string; admin_response: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from("objections")
      .select("reason, status, admin_response")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .maybeSingle()
      .then(({ data }) => {
        setExisting(data);
        setLoading(false);
      });
  }, [open, user, questionId]);

  const handleSubmit = async () => {
    if (!user || !reason.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("objections").insert({
      user_id: user.id,
      question_id: questionId,
      exam_id: examId,
      reason: reason.trim(),
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already submitted objection for this question", variant: "destructive" });
      } else {
        toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      }
      return;
    }
    toast({ title: "Objection submitted successfully ✓" });
    setReason("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-border/50">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-foreground">Raise Objection</h3>
            <p className="text-xs text-muted-foreground">Question {questionNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Question preview */}
        <div className="bg-muted rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-muted-foreground font-medium line-clamp-2">{questionText}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : existing ? (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-xs font-bold text-orange-600 mb-1">Your Objection</p>
              <p className="text-sm text-orange-800">{existing.reason}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                existing.status === "accepted" ? "bg-green-100 text-green-700" :
                existing.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {existing.status === "accepted" ? "✓ Accepted" :
                 existing.status === "rejected" ? "✗ Rejected" :
                 "⏳ Pending Review"}
              </span>
            </div>
            {existing.admin_response && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-600 mb-1">Admin Response</p>
                <p className="text-sm text-blue-800">{existing.admin_response}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl border-2 border-border font-bold text-sm text-foreground hover:bg-muted/50 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe your objection... (e.g., wrong answer key, ambiguous options, incorrect question)"
              className="w-full h-28 rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-orange-400 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-2xl border-2 border-border font-bold text-sm text-foreground hover:bg-muted/50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason.trim()}
                className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                  <AlertTriangle className="h-4 w-4" /> Submit
                </>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
