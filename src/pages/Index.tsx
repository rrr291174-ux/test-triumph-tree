import { useState } from "react";
import { StateSelector } from "@/components/StateSelector";
import { SubjectGrid } from "@/components/SubjectGrid";
import { HeroBanner } from "@/components/HeroBanner";
import { ChevronRight, GraduationCap } from "lucide-react";

const examTypes = [
  {
    id: "sa",
    label: "SA",
    fullName: "School Assistant",
    emoji: "🎓",
    color: "border-blue-400 bg-blue-50",
    activeColor: "border-blue-500 bg-blue-500 text-white",
    textColor: "text-blue-700",
  },
  {
    id: "sgt",
    label: "SGT",
    fullName: "Secondary Grade Teacher",
    emoji: "📖",
    color: "border-emerald-400 bg-emerald-50",
    activeColor: "border-emerald-500 bg-emerald-500 text-white",
    textColor: "text-emerald-700",
  },
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedExamType(null); // reset exam type on state change
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroBanner />

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-primary">50+</div>
            <div className="text-[10px] text-muted-foreground">Test Series</div>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-secondary">200+</div>
            <div className="text-[10px] text-muted-foreground">Notes</div>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-accent">100+</div>
            <div className="text-[10px] text-muted-foreground">Classes</div>
          </div>
        </div>
      </div>

      {/* Step 1: State Selection */}
      <StateSelector selected={selectedState} onSelect={handleStateSelect} />

      {/* Step 2: Exam Type (SA / SGT) — shown only after state selected */}
      {selectedState && (
        <div className="px-4 pb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-semibold text-sm text-foreground">Select Exam Type</h2>
          </div>
          <div className="flex gap-3">
            {examTypes.map((et) => {
              const isActive = selectedExamType === et.id;
              return (
                <button
                  key={et.id}
                  onClick={() => setSelectedExamType(et.id)}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? et.activeColor + " shadow-md scale-[1.02]"
                      : et.color + " hover:scale-[1.01]"
                  }`}
                >
                  <span className="text-2xl">{et.emoji}</span>
                  <div className="text-left">
                    <div className={`font-heading font-bold text-sm ${isActive ? "text-white" : et.textColor}`}>
                      {et.label}
                    </div>
                    <div className={`text-[10px] ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                      {et.fullName}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Subjects — shown only after exam type selected */}
      {selectedState && selectedExamType && (
        <div className="animate-slide-up">
          <SubjectGrid examType={selectedExamType} />
        </div>
      )}
    </div>
  );
};

export default Index;
