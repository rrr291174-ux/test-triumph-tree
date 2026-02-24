import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Video, Clock, Loader2, ExternalLink } from "lucide-react";

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export default function ClassesList() {
  const { subjectSlug } = useParams();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "";
  const [classes, setClasses] = useState<ClassItem[]>([]);
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

      let query = supabase
        .from("classes")
        .select("id, title, description, video_url, duration_minutes, created_at")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (state) {
        query = query.in("state", [state, "both"]);
      }

      const { data } = await query;
      setClasses(data || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug, state]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={`/subject/${subjectSlug}${state ? `?state=${state}` : ""}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName} Classes</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{classes.length} classes available</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : classes.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold text-foreground">No classes yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
          </div>
        ) : (
          classes.map((cls, i) => (
            <a
              key={cls.id}
              href={cls.video_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-slide-up block bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-foreground truncate">{cls.title}</h3>
                  {cls.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cls.description}</p>}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" /> {cls.duration_minutes} min
                  </span>
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
