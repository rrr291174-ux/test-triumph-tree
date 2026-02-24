import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, BookOpen, Video } from "lucide-react";

const resourceTypes = [
  { id: "exams", name: "Exams", icon: FileText, color: "gradient-primary", count: null, link: "/exams" },
  { id: "material", name: "Material", icon: BookOpen, color: "gradient-secondary", count: null, link: "/material" },
  { id: "classes", name: "Classes", icon: Video, color: "gradient-success", count: null, link: "/classes" },
];

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "";
  const subjectName = subjectId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Subject";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName}</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Browse study resources</p>
      </div>

      <div className="px-4 -mt-4 grid grid-cols-2 gap-3">
        {resourceTypes.map((resource, i) => {
          const linkTo = state
            ? `${resource.link}/${subjectId}?state=${state}`
            : `${resource.link}/${subjectId}`;

          const content = (
            <div
              className="animate-slide-up bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border/50 cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${resource.color} flex items-center justify-center mb-3`}>
                <resource.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-foreground">{resource.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {resource.count !== null ? `${resource.count} items` : "View all"}
              </p>
            </div>
          );

          return <Link key={resource.id} to={linkTo}>{content}</Link>;
        })}
      </div>
    </div>
  );
}
