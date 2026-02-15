import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, ClipboardList, Globe, BookOpen, Video, CreditCard } from "lucide-react";

const resourceTypes = [
  { id: "test-series", name: "Test Series", icon: ClipboardList, color: "gradient-primary", count: 12 },
  { id: "exams", name: "Exams", icon: FileText, color: "gradient-secondary", count: 8 },
  { id: "web-tests", name: "Web Tests", icon: Globe, color: "gradient-success", count: 15 },
  { id: "notes", name: "Notes", icon: BookOpen, color: "gradient-primary", count: 20 },
  { id: "classes", name: "Classes", icon: Video, color: "gradient-secondary", count: 10 },
  { id: "class-cards", name: "Class Cards", icon: CreditCard, color: "gradient-success", count: 6 },
];

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const subjectName = subjectId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Subject";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName}</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Browse study resources</p>
      </div>

      {/* Resource Cards */}
      <div className="px-4 -mt-4 grid grid-cols-2 gap-3">
        {resourceTypes.map((resource, i) => (
          <div
            key={resource.id}
            className="animate-slide-up bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50 cursor-pointer"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl ${resource.color} flex items-center justify-center mb-3`}>
              <resource.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-foreground">{resource.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{resource.count} items</p>
          </div>
        ))}
      </div>
    </div>
  );
}
