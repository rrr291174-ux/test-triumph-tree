import { ArrowLeft, Type } from "lucide-react";
import { Link } from "react-router-dom";
import { useFontSize } from "@/hooks/useFontSize";

const sizes = [
  { value: "small" as const, label: "Small", preview: "Aa" },
  { value: "medium" as const, label: "Medium", preview: "Aa" },
  { value: "large" as const, label: "Large", preview: "Aa" },
] as const;

export default function Settings() {
  const { fontSize, setFontSize } = useFontSize();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">⚙️ Settings</h1>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Font Size Setting */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Type className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">Exam Font Size</h2>
              <p className="text-xs text-muted-foreground">Adjust question & option text size</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {sizes.map(s => (
              <button
                key={s.value}
                onClick={() => setFontSize(s.value)}
                className={`rounded-2xl p-4 border-2 transition-all text-center ${
                  fontSize === s.value
                    ? "border-primary bg-primary/10 shadow"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className={`font-bold block mb-1 ${
                  s.value === "small" ? "text-sm" : s.value === "medium" ? "text-lg" : "text-2xl"
                } ${fontSize === s.value ? "text-primary" : "text-foreground"}`}>
                  {s.preview}
                </span>
                <span className={`text-xs font-semibold ${fontSize === s.value ? "text-primary" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Preview:</p>
            <p className={`font-bold text-foreground ${
              fontSize === "small" ? "text-base" : fontSize === "medium" ? "text-lg" : "text-xl"
            }`}>
              What is the capital of India?
            </p>
            <p className={`text-muted-foreground mt-1 ${
              fontSize === "small" ? "text-sm" : fontSize === "medium" ? "text-base" : "text-lg"
            }`}>
              a) Mumbai  b) New Delhi  c) Kolkata  d) Chennai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
