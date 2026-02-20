import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";
import { SubjectGrid } from "@/components/SubjectGrid";
import { motion } from "framer-motion";

export default function SubjectsPage() {
  const { examType } = useParams<{ examType: string }>();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stateLabel = state === "ap" ? "Andhra Pradesh" : state === "ts" ? "Telangana" : "";
  const examLabel = examType === "sgt" ? "Secondary Grade Teacher" : "School Assistant";

  return (
    <div
      className="min-h-screen pb-24 transition-colors duration-300"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at 50% 0%, #0d1f4a 0%, #060c1a 45%, #040810 100%)"
          : "linear-gradient(160deg, #fff7ed 0%, #fef3c7 15%, #dbeafe 45%, #ede9fe 75%, #fce7f3 100%)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-4 font-semibold text-sm"
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#1e3a8a" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Exam type badge */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.18)",
                border: "1px solid rgba(245,158,11,0.4)",
                color: isDark ? "#fde68a" : "#92400e",
              }}
            >
              <GraduationCap className="h-3 w-3" />
              {examType?.toUpperCase()} • {stateLabel}
            </div>
          </div>

          <h1
            className="font-heading font-black text-2xl tracking-tight"
            style={{ color: isDark ? "#fff" : "#1e1b4b" }}
          >
            Choose Your{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #f59e0b, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Subject
            </span>
          </h1>
          <p className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
            {examLabel}
          </p>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5))" }} />
          <span className="font-bold text-xs tracking-widest uppercase" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,58,138,0.5)" }}>
            All Subjects
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), transparent)" }} />
        </div>
      </div>

      {/* Subjects or Coming Soon */}
      {examType === "sgt" ? (
        <SubjectGrid examType="sgt" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 py-8 text-center"
        >
          <div
            className="rounded-2xl py-10 px-6"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
              border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(30,58,138,0.12)",
              boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div className="text-5xl mb-4">🚀</div>
            <div className="font-heading font-bold text-lg mb-2" style={{ color: isDark ? "#fff" : "#1e1b4b" }}>
              Coming Soon!
            </div>
            <div className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              SA subjects త్వరలో వస్తాయి...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
