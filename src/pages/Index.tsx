import { useState, useRef } from "react";
import { SubjectGrid } from "@/components/SubjectGrid";
import { ChevronRight, GraduationCap, MapPin, Rocket, BookOpen } from "lucide-react";
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

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
  const examSectionRef = useRef<HTMLDivElement>(null);
  const subjectSectionRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #0d1128 40%, #0a1020 100%)" }}>

      {/* Hero Section */}
      <motion.div
        className="relative px-4 pt-6 pb-6 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Star particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        {/* Golden glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #f59e0b, transparent)" }} />

        <div className="relative z-10 text-center">
          {/* AP & TG Banner */}
          <motion.div
            className="inline-block mb-3"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
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
          </motion.div>

          {/* Best Study Platform */}
          <motion.div
            className="mb-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="font-heading font-extrabold text-3xl leading-tight text-white">
              Best{" "}
              <span style={{ color: "#f59e0b", textShadow: "0 0 15px rgba(245,158,11,0.6)" }}>
                Study
              </span>{" "}
              Platform 🎯
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-yellow-400 text-xs">✦</span>
              <p className="text-white/70 text-xs">Complete Preparation with</p>
              <span className="text-yellow-400 text-xs">✦</span>
            </div>
            <p className="text-white/60 text-xs mb-5">
              📚 Test Series, Notes & Live Classes 🚀
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                boxShadow: "0 4px 15px rgba(249,115,22,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(249,115,22,0.7)" }}
            >
              <Rocket className="h-4 w-4" />
              Start Practice
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 4px 15px rgba(59,130,246,0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(59,130,246,0.7)" }}
            >
              <BookOpen className="h-4 w-4" />
              Courses
              <ChevronRight className="h-3 w-3" />
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
          <span className="text-white font-bold text-sm tracking-widest uppercase">Select Your State</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
        </motion.div>

        {/* State Cards */}
        <motion.div
          className="flex flex-col gap-4"
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
                style={{ borderRadius: "20px" }}
                variants={subjectItem}
                animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Glow border via box-shadow */}
                <motion.div
                  className="absolute inset-0 rounded-[20px]"
                  animate={{
                    boxShadow: isSelected
                      ? "0 0 25px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.2), inset 0 0 0 2px #f97316"
                      : "0 0 15px rgba(245,158,11,0.15), inset 0 0 0 1.5px rgba(245,158,11,0.3)",
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Card background */}
                <div className="absolute inset-0 rounded-[20px]" style={{ background: "linear-gradient(135deg, #f8f4e8 0%, #ffffff 50%, #f0f4f8 100%)" }} />

                {/* Indian flag color strip at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-[20px] overflow-hidden">
                  <div className={`h-full w-full bg-gradient-to-r ${state.stripColors}`} />
                </div>

                {/* Golden top glow when selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px]"
                      style={{ background: "linear-gradient(90deg, transparent, #f59e0b, transparent)" }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 p-4 flex items-center gap-3">
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

                  <div className="relative w-32 h-20 flex-shrink-0">
                    <img
                      src={state.image}
                      alt={state.name}
                      className="w-full h-full object-cover rounded-xl"
                      style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}
                    />
                  </div>

                  <motion.div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #ea580c, #f97316)",
                      boxShadow: "0 4px 10px rgba(249,115,22,0.5)",
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
                <span className="text-white font-bold text-sm tracking-widest uppercase">Select Exam Type</span>
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

      {/* Step 3: Subjects */}
      <div ref={subjectSectionRef}>
        <AnimatePresence>
          {selectedState && selectedExamType && (
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="px-4 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
                  <span className="text-white font-bold text-sm tracking-widest uppercase">Choose Subject</span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
                </div>
                <div className="flex items-center gap-1 ml-2" style={{ color: "#f59e0b" }}>
                  <GraduationCap className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">{selectedExamType}</span>
                </div>
              </div>
              <SubjectGrid examType={selectedExamType} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
