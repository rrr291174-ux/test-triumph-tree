import { Lock, ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function LockedContent({ backTo = "/" }: { backTo?: string }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const userId = user?.id || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={backTo} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">🔒 Content Locked</h1>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-heading font-bold text-lg text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            ఈ content access చేయాలంటే, మీ User ID ని admin కి పంపండి. Admin approve చేసిన తర్వాత unlock అవుతుంది.
          </p>

          {user && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Your User ID:</p>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                <code className="flex-1 text-xs text-foreground break-all select-all">{userId}</code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-background transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 font-medium">Copied!</p>}
            </div>
          )}

          {!user && (
            <Link
              to="/auth"
              className="inline-block gradient-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm"
            >
              Sign In First
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
