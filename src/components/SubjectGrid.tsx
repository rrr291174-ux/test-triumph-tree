import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

import psychologyImg from "@/assets/subjects/psychology.jpg";
import teluguImg from "@/assets/subjects/telugu.jpg";
import englishImg from "@/assets/subjects/english.jpg";
import mathematicsImg from "@/assets/subjects/mathematics.jpg";
import evsImg from "@/assets/subjects/evs.jpg";
import scienceImg from "@/assets/subjects/science.jpg";
import socialImg from "@/assets/subjects/social.jpg";
import teluguMethodImg from "@/assets/subjects/telugu-method.jpg";
import englishMethodImg from "@/assets/subjects/english-method.jpg";
import triMethodImg from "@/assets/subjects/tri-method.jpg";
import perspectiveImg from "@/assets/subjects/perspective.jpg";

export interface Subject {
  id: string;
  name: string;
  image: string;
  tests: number;
  accentColor: string;
}

const subjects: Subject[] = [
  { id: "psychology",    name: "Psychology",     image: psychologyImg,    tests: 12, accentColor: "#818cf8" },
  { id: "telugu",        name: "Telugu",          image: teluguImg,        tests: 15, accentColor: "#f59e0b" },
  { id: "english",       name: "English",         image: englishImg,       tests: 18, accentColor: "#fb923c" },
  { id: "mathematics",   name: "Mathematics",     image: mathematicsImg,   tests: 20, accentColor: "#f59e0b" },
  { id: "evs",           name: "EVS",             image: evsImg,           tests: 10, accentColor: "#34d399" },
  { id: "science",       name: "Science",         image: scienceImg,       tests: 16, accentColor: "#38bdf8" },
  { id: "social",        name: "Social",          image: socialImg,        tests: 14, accentColor: "#60a5fa" },
  { id: "telugu-method", name: "Telugu Method",   image: teluguMethodImg,  tests: 8,  accentColor: "#fbbf24" },
  { id: "english-method",name: "English Method",  image: englishMethodImg, tests: 8,  accentColor: "#f97316" },
  { id: "tri-method",    name: "Tri Method",      image: triMethodImg,     tests: 6,  accentColor: "#d97706" },
  { id: "perspective",   name: "Perspective",     image: perspectiveImg,   tests: 10, accentColor: "#fb923c" },
];

interface SubjectGridProps {
  examType?: string;
}

export function SubjectGrid({ examType }: SubjectGridProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="px-3 pb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {subjects.map((subject, i) => (
          <Link
            key={subject.id}
            to={`/subject/${subject.id}`}
            className="group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              style={{
                boxShadow: isDark
                  ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`
                  : `0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)`,
                aspectRatio: "1 / 1",
              }}
            >
              {/* 3D HD Image */}
              <img
                src={subject.image}
                alt={subject.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Bottom gradient overlay for text */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 100%)",
                }}
              />

              {/* Accent glow border on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `inset 0 0 0 2px ${subject.accentColor}`,
                }}
              />

              {/* Tests badge */}
              <div
                className="absolute top-2 right-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  border: `1px solid ${subject.accentColor}60`,
                  backdropFilter: "blur(6px)",
                  color: subject.accentColor,
                }}
              >
                {subject.tests} tests
              </div>

              {/* Subject name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <span
                  className="font-heading font-bold text-xs leading-tight text-white drop-shadow-lg block"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
                >
                  {subject.name}
                </span>
                {/* Accent underline */}
                <div
                  className="h-[2px] mt-1 rounded-full w-0 group-hover:w-full transition-all duration-400"
                  style={{ background: subject.accentColor }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export { subjects };
