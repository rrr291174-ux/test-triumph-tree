import { useState } from "react";
import { StateSelector } from "@/components/StateSelector";
import { SubjectGrid } from "@/components/SubjectGrid";
import { ChevronRight, GraduationCap, BookOpen, Trophy, Video, Star } from "lucide-react";

const examTypes = [
  {
    id: "sa",
    label: "SA",
    fullName: "School Assistant",
    emoji: "🎓",
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 border-blue-200",
    activeBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    id: "sgt",
    label: "SGT",
    fullName: "Secondary Grade Teacher",
    emoji: "📖",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 border-emerald-200",
    activeBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
];

const stats = [
  { value: "50+", label: "Test Series", icon: Trophy, color: "text-orange-500", bg: "bg-orange-50" },
  { value: "200+", label: "Notes", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { value: "100+", label: "Classes", icon: Video, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedExamType(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Hero Section */}
      <div className="gradient-hero px-4 pt-6 pb-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute top-10 -right-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            <span className="text-white/80 text-xs font-semibold">AP & TS Competitive Exams</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-white leading-tight">
            Best Study<br />Platform 🎯
          </h1>
          <p className="text-white/75 text-xs mt-2 leading-relaxed max-w-[220px]">
            Complete preparation with Test Series, Notes & Live Classes
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="bg-white/20 rounded-full px-3 py-1">
              <span className="text-[10px] text-white font-bold">SA • SGT • DSC</span>
            </div>
            <div className="bg-yellow-400/30 rounded-full px-3 py-1">
              <span className="text-[10px] text-yellow-200 font-bold">🏆 Trusted by 1000+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 -mt-5 mb-5">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-3 shadow-card border border-border/50 text-center">
              <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-1`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`font-heading font-extrabold text-lg ${stat.color} leading-none`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: State Selection */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full gradient-hero flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">1</span>
          </div>
          <h2 className="font-heading font-bold text-base text-foreground">Select Your State</h2>
        </div>
        <div className="flex flex-col gap-4">
          {[
            {
              id: "ap",
              name: "Andhra Pradesh",
              short: "AP",
              capital: "Amaravati",
              flag: "🏛️",
              bg: "from-yellow-400 to-orange-500",
              lightBg: "bg-orange-50 border-orange-200",
              seal: "⚜️",
              desc: "AP DSC • APPSC • TET",
            },
            {
              id: "ts",
              name: "Telangana",
              short: "TS",
              capital: "Hyderabad",
              flag: "🏰",
              bg: "from-pink-500 to-rose-600",
              lightBg: "bg-rose-50 border-rose-200",
              seal: "🌺",
              desc: "TS DSC • TSPSC • TET",
            },
          ].map((state) => {
            const isSelected = selectedState === state.id;
            return (
              <button
                key={state.id}
                onClick={() => handleStateSelect(state.id)}
                className={`w-full relative overflow-hidden rounded-3xl border-2 transition-all duration-300 text-left ${
                  isSelected ? "border-transparent scale-[1.01] shadow-xl" : "border-border bg-card shadow-card"
                }`}
              >
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${state.bg}`} />
                )}
                {!isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${state.bg} opacity-10`} />
                )}
                <div className="relative z-10 p-5 flex items-center gap-5">
                  {/* Big State Emblem */}
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg ${isSelected ? "bg-white/20" : "bg-white/60 border border-border"}`}>
                    <span className="text-4xl">{state.flag}</span>
                    <span className="text-[10px] font-extrabold mt-1 text-foreground/70">{state.short}</span>
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <div className={`font-heading font-extrabold text-2xl leading-tight ${isSelected ? "text-white" : "text-foreground"}`}>
                      {state.short}
                    </div>
                    <div className={`font-semibold text-sm ${isSelected ? "text-white/90" : "text-foreground/80"}`}>
                      {state.name}
                    </div>
                    <div className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                      🏙️ {state.capital}
                    </div>
                    <div className={`text-[11px] mt-2 font-bold ${isSelected ? "text-white/80" : "text-primary"}`}>
                      {state.desc}
                    </div>
                  </div>
                  {/* Check / Arrow */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-white/30" : "bg-primary/10"}`}>
                    {isSelected
                      ? <span className="text-white font-bold text-sm">✓</span>
                      : <ChevronRight className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Exam Type */}
      {selectedState && (
        <div className="px-4 mb-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full gradient-hero flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">2</span>
            </div>
            <h2 className="font-heading font-bold text-sm text-foreground">Select Exam Type</h2>
          </div>
          <div className="flex gap-3">
            {examTypes.map((et) => {
              const isActive = selectedExamType === et.id;
              return (
                <button
                  key={et.id}
                  onClick={() => setSelectedExamType(et.id)}
                  className={`flex-1 relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    isActive
                      ? "border-transparent shadow-lg scale-[1.03]"
                      : "border-border bg-card shadow-card hover:scale-[1.02]"
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${et.gradient}`} />
                  )}
                  <div className="relative z-10 p-4 flex flex-col items-center gap-2">
                    <span className="text-3xl">{et.emoji}</span>
                    <div>
                      <div className={`font-heading font-extrabold text-xl ${isActive ? "text-white" : "text-foreground"}`}>
                        {et.label}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-white/80" : "text-muted-foreground"} text-center leading-tight`}>
                        {et.fullName}
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 bg-white/25 rounded-full px-2 py-0.5">
                        <span className="text-[9px] text-white font-bold">Selected</span>
                        <ChevronRight className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Subjects */}
      {selectedState && selectedExamType && (
        <div className="animate-slide-up">
          <div className="px-4 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">3</span>
              </div>
              <h2 className="font-heading font-bold text-sm text-foreground">Choose Subject</h2>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <GraduationCap className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase">{selectedExamType}</span>
            </div>
          </div>
          <SubjectGrid examType={selectedExamType} />
        </div>
      )}

      {/* Empty state when nothing selected */}
      {!selectedState && (
        <div className="px-4 mt-4">
          <div className="bg-card rounded-2xl p-6 border border-dashed border-border text-center">
            <div className="text-4xl mb-2">👆</div>
            <p className="text-sm text-muted-foreground font-medium">మీ state select చేయండి</p>
            <p className="text-xs text-muted-foreground mt-1">AP లేదా Telangana ని choose చేయండి</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
