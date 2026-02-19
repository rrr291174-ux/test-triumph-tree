import { Link } from "react-router-dom";
import {
  Brain, BookOpen, Globe, Calculator, Leaf, FlaskConical,
  Users, BookMarked, Lightbulb, Languages, Compass
} from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  tests: number;
  notes: number;
}

const subjects: Subject[] = [
  { id: "psychology", name: "Psychology", icon: Brain, colorClass: "text-subject-psychology", bgClass: "bg-subject-psychology/15", tests: 12, notes: 8 },
  { id: "telugu", name: "Telugu", icon: BookOpen, colorClass: "text-subject-telugu", bgClass: "bg-subject-telugu/15", tests: 15, notes: 10 },
  { id: "english", name: "English", icon: Globe, colorClass: "text-subject-english", bgClass: "bg-subject-english/15", tests: 18, notes: 12 },
  { id: "mathematics", name: "Mathematics", icon: Calculator, colorClass: "text-subject-math", bgClass: "bg-subject-math/15", tests: 20, notes: 14 },
  { id: "evs", name: "EVS", icon: Leaf, colorClass: "text-subject-evs", bgClass: "bg-subject-evs/15", tests: 10, notes: 6 },
  { id: "science", name: "Science", icon: FlaskConical, colorClass: "text-subject-science", bgClass: "bg-subject-science/15", tests: 16, notes: 11 },
  { id: "social", name: "Social", icon: Users, colorClass: "text-subject-social", bgClass: "bg-subject-social/15", tests: 14, notes: 9 },
  { id: "telugu-method", name: "Telugu Method", icon: BookMarked, colorClass: "text-subject-telugu", bgClass: "bg-subject-telugu/15", tests: 8, notes: 5 },
  { id: "english-method", name: "English Method", icon: Languages, colorClass: "text-subject-english", bgClass: "bg-subject-english/15", tests: 8, notes: 5 },
  { id: "tri-method", name: "Tri Method", icon: Compass, colorClass: "text-subject-method", bgClass: "bg-subject-method/15", tests: 6, notes: 4 },
  { id: "perspective", name: "Perspective", icon: Lightbulb, colorClass: "text-subject-perspective", bgClass: "bg-subject-perspective/15", tests: 10, notes: 7 },
];

interface SubjectGridProps {
  examType?: string;
}

export function SubjectGrid({ examType }: SubjectGridProps) {
  return (
    <div className="px-4 pb-4">
      <h2 className="font-heading font-bold text-lg mb-3 text-foreground">📚 Subjects</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {subjects.map((subject, i) => (
          <Link
            key={subject.id}
            to={`/subject/${subject.id}`}
            className="animate-slide-up group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50">
              <div className={`w-12 h-12 rounded-xl ${subject.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <subject.icon className={`h-6 w-6 ${subject.colorClass}`} />
              </div>
              <span className="text-xs font-semibold text-center leading-tight text-foreground">
                {subject.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {subject.tests} tests
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export { subjects };
