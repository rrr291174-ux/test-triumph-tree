import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { SubjectGrid } from "@/components/SubjectGrid";
import { ChevronRight, GraduationCap, MapPin, Rocket, BookOpen, Trophy, FileText, Video } from "lucide-react";
import apStateCard from "@/assets/ap-state-card.png";
import tsStateCard from "@/assets/ts-state-card.png";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];


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

const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25, ease: "easeIn" as const } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const examTypeItem: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

const subjectItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: easeOut } },
};

const stats = [
  { icon: Trophy, label: "Test Series", target: 50, suffix: "+", color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  { icon: FileText, label: "Notes", target: 200, suffix: "+", color: "#38bdf8", glow: "rgba(56,189,248,0.4)" },
  { icon: Video, label: "Classes", target: 100, suffix: "+", color: "#a78bfa", glow: "rgba(167,139,250,0.4)" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const examSectionRef = useRef<HTMLDivElement>(null);
  const subjectSectionRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedExamType(null);
    setTimeout(() => {
      examSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleExamTypeSelect = (examId: string) => {
    setSelectedExamType(examId);
    setTimeout(() => {
      subjectSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-300"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at 50% 0%, #0d1f4a 0%, #060c1a 45%, #040810 100%)"
          : "radial-gradient(ellipse at 50% 0%, #dbeafe 0%, #f0f4ff 45%, #f8faff 100%)",
      }}
    >
      {/* Hero Section */}
      <motion.div
        className="relative px-4 pt-5 pb-7 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {/* Cinematic background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Orange glow left */}
          <div
            className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, #ea580c, transparent 70%)" }}
          />
          {/* Blue glow right */}
          <div
            className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, #1d4ed8, transparent 70%)" }}
          />
          {/* Center gold glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-20 blur-2xl opacity-15"
            style={{ background: "radial-gradient(ellipse, #f59e0b, transparent)" }}
          />
          {/* Twinkling stars — dark mode only */}
          {isDark && [...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: (i % 3 === 0 ? 2 : 1) + "px",
                height: (i % 3 === 0 ? 2 : 1) + "px",
                top: (i * 4.1) % 100 + "%",
                left: (i * 7.3) % 100 + "%",
              }}
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.5, 1] }}
              transition={{
                duration: 2.5 + (i % 4),
                repeat: Infinity,
                delay: (i * 0.3) % 3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          {/* AP & TG golden badge */}
          <motion.div
            className="inline-flex flex-col items-center mb-4"
            initial={{ opacity: 0, y: -24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
          >
            {/* Laurel row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌿</span>
              <div
                className="px-6 py-1.5 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #92400e, #d97706, #f59e0b, #d97706, #92400e)",
                  boxShadow: "0 0 24px rgba(245,158,11,0.55), 0 0 48px rgba(245,158,11,0.2)",
                  border: "1px solid rgba(255,200,50,0.3)",
                }}
              >
                <span
                  className="font-heading font-extrabold text-3xl tracking-tight"
                  style={{
                    color: "#fff",
                    textShadow: "0 0 12px rgba(255,200,50,0.9), 0 2px 4px rgba(0,0,0,0.5)",
                    letterSpacing: "0.04em",
                  }}
                >
                  AP & TG
                </span>
              </div>
              <span className="text-xl">🌿</span>
            </div>
            {/* Competitive Exams subtitle under badge */}
            <div
              className="px-5 py-1 rounded-lg"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <span
                className="text-sm font-bold italic tracking-wide"
                style={{ color: "#fde68a" }}
              >
                Competitive Exams
              </span>
            </div>
          </motion.div>

          {/* Best Study Platform headline */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: easeOut }}
          >
            <h1 className="font-heading font-black text-[2.6rem] leading-[1.1] text-white tracking-tight drop-shadow-lg">
              Best{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde68a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 18px rgba(245,158,11,0.85))",
                }}
              >
                Study
              </span>
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #ffffff, #e0e7ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Platform
              </span>{" "}🎯
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
          >
            <p
              className="text-sm font-semibold leading-relaxed"
              style={{ color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)" }}
            >
              Complete preparation with
            </p>
            <p
              className="text-sm font-bold"
              style={{
                background: "linear-gradient(90deg, #fbbf24, #38bdf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Test Series, Notes &amp; Live Classes
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: easeOut }}
          >
            {/* Orange glossy button */}
            <motion.button
              className="relative flex items-center gap-2 px-7 py-3.5 rounded-2xl font-extrabold text-sm text-white overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #ff6a00, #ee0979, #f97316)",
                boxShadow: "0 6px 28px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,160,80,0.5)",
              }}
              whileTap={{ scale: 0.93 }}
              whileHover={{
                scale: 1.06,
                boxShadow: "0 8px 36px rgba(249,115,22,0.8), 0 0 60px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              {/* Gloss overlay */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)" }}
              />
              <Rocket className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Start Practice</span>
            </motion.button>

            {/* Blue glossy button */}
            <motion.button
              className="relative flex items-center gap-2 px-7 py-3.5 rounded-2xl font-extrabold text-sm text-white overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #2563eb, #38bdf8)",
                boxShadow: "0 6px 28px rgba(37,99,235,0.6), 0 0 50px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
                border: "1px solid rgba(96,165,250,0.5)",
              }}
              whileTap={{ scale: 0.93 }}
              whileHover={{
                scale: 1.06,
                boxShadow: "0 8px 36px rgba(37,99,235,0.8), 0 0 60px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              {/* Gloss overlay */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)" }}
              />
              <BookOpen className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Courses</span>
              <ChevronRight className="h-3.5 w-3.5 relative z-10" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>




      {/* Select Your State */}
      <div className="px-4 mb-4">
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
          <span className="font-bold text-sm tracking-widest uppercase" style={{ color: isDark ? "#fff" : "#1e3a8a" }}>Select Your State</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
        </motion.div>

        {/* State Cards */}
        <motion.div
          className="flex flex-col gap-5"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {states.map((state) => {
            const isSelected = selectedState === state.id;
            return (
              <motion.button
                key={state.id}
                onClick={() => handleStateSelect(state.id)}
                className="w-full text-left relative overflow-hidden"
                style={{ borderRadius: "20px", minHeight: "130px" }}
                variants={subjectItem}
                animate={isSelected ? { scale: 1.025 } : { scale: 1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Full scenic background image */}
                <img
                  src={state.image}
                  alt={`${state.name}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ borderRadius: "20px" }}
                />

                {/* Left gradient overlay for text readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    borderRadius: "20px",
                    background: "linear-gradient(90deg, rgba(10,15,40,0.88) 0%, rgba(10,15,40,0.75) 45%, rgba(10,15,40,0.15) 75%, transparent 100%)",
                  }}
                />

                {/* Glow border */}
                <motion.div
                  className="absolute inset-0"
                  style={{ borderRadius: "20px" }}
                  animate={{
                    boxShadow: isSelected
                      ? "0 0 28px rgba(249,115,22,0.65), 0 0 55px rgba(249,115,22,0.25), inset 0 0 0 2.5px rgba(249,115,22,0.9)"
                      : "0 6px 28px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(245,158,11,0.35)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Selected golden top bar */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{
                        borderRadius: "20px 20px 0 0",
                        background: "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)",
                      }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>

                {/* Indian tricolor ribbon at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-[5px] overflow-hidden" style={{ borderRadius: "0 0 20px 20px" }}>
                  <div className={`h-full w-full bg-gradient-to-r ${state.stripColors}`} />
                </div>

                {/* Text content overlay */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* State name */}
                    <div
                      className="font-heading font-black text-[1.45rem] leading-tight tracking-tight mb-1"
                      style={{
                        color: "#fff",
                        textShadow: "0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {state.name}
                    </div>

                    {/* Capital subtitle */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: "#f97316" }} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                      >
                        {state.capital}
                      </span>
                    </div>

                    {/* Tags */}
                    <div
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(249,115,22,0.7)",
                        color: "#fff",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 0 14px rgba(249,115,22,0.3)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      <span style={{ color: "#fb923c" }}>{state.desc}</span>
                    </div>
                  </div>

                  {/* Arrow button */}
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-3"
                    style={{
                      background: "linear-gradient(135deg, #ea580c, #f97316)",
                      boxShadow: "0 4px 16px rgba(249,115,22,0.7)",
                    }}
                    animate={isSelected ? { rotate: 90 } : { rotate: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Telugu prompt when nothing selected */}
      <AnimatePresence>
        {!selectedState && (
          <motion.div
            className="px-4 mt-2 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base font-bold" style={{ color: "#f59e0b" }}>
              👆 AP లేదా Telangana ని Select చేయండి.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: Exam Type */}
      <div ref={examSectionRef}>
        <AnimatePresence>
          {selectedState && (
            <motion.div
              className="px-4 mb-5"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
                <span className="font-bold text-sm tracking-widest uppercase" style={{ color: isDark ? "#fff" : "#1e3a8a" }}>Select Exam Type</span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
              </div>
              <motion.div
                className="flex gap-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {examTypes.map((et) => {
                  const isActive = selectedExamType === et.id;
                  return (
                    <motion.button
                      key={et.id}
                      onClick={() => handleExamTypeSelect(et.id)}
                      className="flex-1 relative overflow-hidden rounded-2xl border-2"
                      style={{
                        borderColor: isActive ? "transparent" : "rgba(255,255,255,0.1)",
                        background: isActive ? undefined : "rgba(255,255,255,0.05)",
                      }}
                      variants={examTypeItem}
                      whileTap={{ scale: 0.95 }}
                      animate={isActive ? { scale: 1.04 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${et.gradient}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <div className="relative z-10 p-4 flex flex-col items-center gap-2">
                        <motion.span
                          className="text-3xl"
                          animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {et.emoji}
                        </motion.span>
                        <div>
                          <div className="font-heading font-extrabold text-xl text-white">
                            {et.label}
                          </div>
                          <div className={`text-[10px] ${isActive ? "text-white/80" : "text-white/50"} text-center leading-tight`}>
                            {et.fullName}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              className="flex items-center gap-1 bg-white/25 rounded-full px-2 py-0.5"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.25 }}
                            >
                              <span className="text-[9px] text-white font-bold">Selected</span>
                              <ChevronRight className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 3: Subjects (SGT only) */}
      <div ref={subjectSectionRef}>
        <AnimatePresence>
          {selectedState && selectedExamType === "sgt" && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
                  <span className="font-bold text-sm tracking-widest uppercase" style={{ color: isDark ? "#fff" : "#1e3a8a" }}>Choose Subject</span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
                </div>
                <div className="flex items-center gap-1 ml-2" style={{ color: "#f59e0b" }}>
                  <GraduationCap className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">SGT</span>
                </div>
              </div>
              <SubjectGrid examType="sgt" />
            </motion.div>
          )}
          {selectedState && selectedExamType === "sa" && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-4 py-8 text-center"
            >
              <div
                className="rounded-2xl py-8 px-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                <div className="text-4xl mb-3">🚀</div>
                <div className="font-heading font-bold text-white text-lg mb-1">Coming Soon!</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  SA subjects త్వరలో వస్తాయి...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
