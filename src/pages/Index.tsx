import { useState } from "react";
import { SubjectGrid } from "@/components/SubjectGrid";
import { ChevronRight, GraduationCap, MapPin, Rocket, BookOpen } from "lucide-react";
import apStateCard from "@/assets/ap-state-card.png";
import tsStateCard from "@/assets/ts-state-card.png";

const examTypes = [
  {
    id: "sa",
    label: "SA",
    fullName: "School Assistant",
    emoji: "🎓",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "sgt",
    label: "SGT",
    fullName: "Secondary Grade Teacher",
    emoji: "📖",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const states = [
  {
    id: "ap",
    name: "ANDHRA PRADESH",
    short: "AP",
    capital: "Amaravati",
    desc: "AP DSC • APPSC • TET",
    image: apStateCard,
    accentColor: "#f97316",
    stripColors: "from-orange-500 via-white to-green-600",
  },
  {
    id: "ts",
    name: "TELANGANA",
    short: "TG",
    capital: "Hyderabad",
    desc: "TG DSC • TSPSC • TET",
    image: tsStateCard,
    accentColor: "#f97316",
    stripColors: "from-pink-500 via-white to-green-600",
  },
];

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedExamType(null);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #0d1128 40%, #0a1020 100%)" }}>

      {/* Hero Section */}
      <div className="relative px-4 pt-6 pb-6 overflow-hidden">
        {/* Star particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Golden glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #f59e0b, transparent)" }} />

        <div className="relative z-10 text-center">
          {/* AP & TG Banner */}
          <div className="inline-block mb-3">
            <div className="relative">
              {/* Laurel wreaths */}
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-2xl">🏆</span>
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-2xl">🏆</span>
              <div
                className="px-8 py-2 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, #b45309, #f59e0b, #d97706)",
                  boxShadow: "0 0 20px rgba(245, 158, 11, 0.5)",
                }}
              >
                <div className="font-heading font-extrabold text-2xl leading-tight"
                  style={{ color: "#fff", textShadow: "0 0 10px rgba(245,158,11,0.8)" }}>
                  AP & TG
                </div>
                <div className="text-xs font-bold italic" style={{ color: "#fef3c7" }}>
                  Competitive Exams
                </div>
              </div>
            </div>
          </div>

          {/* Best Study Platform */}
          <div className="mb-2">
            <h1 className="font-heading font-extrabold text-3xl leading-tight text-white">
              Best{" "}
              <span style={{ color: "#f59e0b", textShadow: "0 0 15px rgba(245,158,11,0.6)" }}>
                Study
              </span>{" "}
              Platform 🎯
            </h1>
          </div>

          {/* Subtitle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-400 text-xs">✦</span>
            <p className="text-white/70 text-xs">Complete Preparation with</p>
            <span className="text-yellow-400 text-xs">✦</span>
          </div>
          <p className="text-white/60 text-xs mb-5">
            📚 Test Series, Notes & Live Classes 🚀
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                boxShadow: "0 4px 15px rgba(249,115,22,0.5)",
              }}
            >
              <Rocket className="h-4 w-4" />
              Start Practice
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 4px 15px rgba(59,130,246,0.5)",
              }}
            >
              <BookOpen className="h-4 w-4" />
              Courses
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Select Your State */}
      <div className="px-4 mb-4">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
          <span className="text-white font-bold text-sm tracking-widest uppercase">Select Your State</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
        </div>

        {/* State Cards */}
        <div className="flex flex-col gap-4">
          {states.map((state) => {
            const isSelected = selectedState === state.id;
            return (
              <button
                key={state.id}
                onClick={() => handleStateSelect(state.id)}
                className="w-full text-left relative overflow-hidden transition-all duration-300 active:scale-[0.98]"
                style={{
                  borderRadius: "20px",
                  boxShadow: isSelected
                    ? `0 0 25px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.2), inset 0 0 0 2px ${state.accentColor}`
                    : "0 0 15px rgba(245,158,11,0.15), inset 0 0 0 1.5px rgba(245,158,11,0.3)",
                }}
              >
                {/* Card background */}
                <div className="absolute inset-0 rounded-[20px]" style={{ background: "linear-gradient(135deg, #f8f4e8 0%, #ffffff 50%, #f0f4f8 100%)" }} />

                {/* Indian flag color strip at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-[20px] overflow-hidden">
                  <div className={`h-full w-full bg-gradient-to-r ${state.stripColors}`} />
                </div>

                {/* Golden top glow when selected */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px]"
                    style={{ background: "linear-gradient(90deg, transparent, #f59e0b, transparent)" }} />
                )}

                <div className="relative z-10 p-4 flex items-center gap-3">
                  {/* Text Info */}
                  <div className="flex-1">
                    <div className="font-heading font-extrabold text-2xl leading-none text-gray-900 tracking-tight mb-1">
                      {state.name}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      <span className="text-blue-600 text-xs font-semibold">{state.capital}</span>
                    </div>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
                    >
                      {state.desc}
                    </div>
                  </div>

                  {/* State Image */}
                  <div className="relative w-32 h-20 flex-shrink-0">
                    <img
                      src={state.image}
                      alt={state.name}
                      className="w-full h-full object-cover rounded-xl"
                      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                    />
                  </div>

                  {/* Arrow button */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #ea580c, #f97316)",
                      boxShadow: "0 4px 10px rgba(249,115,22,0.5)",
                    }}
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telugu prompt when nothing selected */}
      {!selectedState && (
        <div className="px-4 mt-2 text-center animate-fade-in">
          <p className="text-base font-bold" style={{ color: "#f59e0b" }}>
            👆 AP లేదా Telangana ని Select చేయండి.
          </p>
        </div>
      )}

      {/* Step 2: Exam Type */}
      {selectedState && (
        <div className="px-4 mb-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
            <span className="text-white font-bold text-sm tracking-widest uppercase">Select Exam Type</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
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
                      : "border-white/10 shadow-card hover:scale-[1.02]"
                  }`}
                  style={{
                    background: isActive
                      ? undefined
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${et.gradient}`} />
                  )}
                  <div className="relative z-10 p-4 flex flex-col items-center gap-2">
                    <span className="text-3xl">{et.emoji}</span>
                    <div>
                      <div className={`font-heading font-extrabold text-xl ${isActive ? "text-white" : "text-white"}`}>
                        {et.label}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-white/80" : "text-white/50"} text-center leading-tight`}>
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
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
              <span className="text-white font-bold text-sm tracking-widest uppercase">Choose Subject</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: "#f59e0b" }}>
              <GraduationCap className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase">{selectedExamType}</span>
            </div>
          </div>
          <SubjectGrid examType={selectedExamType} />
        </div>
      )}
    </div>
  );
};

export default Index;
