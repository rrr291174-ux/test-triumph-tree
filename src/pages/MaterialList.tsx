import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen, FileText, Loader2, ExternalLink } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
}

export default function MaterialList() {
  const { subjectSlug } = useParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: subject } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("slug", subjectSlug)
        .maybeSingle();

      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      const { data } = await supabase
        .from("materials")
        .select("id, title, description, file_url, file_type, created_at")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setMaterials(data || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={`/subject/${subjectSlug}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName} Material</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{materials.length} resources available</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : materials.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">No materials yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        ) : (
          materials.map((mat, i) => (
            <a
              key={mat.id}
              href={mat.file_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-slide-up block bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-foreground truncate">{mat.title}</h3>
                  {mat.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{mat.description}</p>}
                  <span className="text-xs text-muted-foreground mt-1 inline-block">{mat.file_type?.toUpperCase() || "FILE"}</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
