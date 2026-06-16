import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Video, Clock, Loader2, ExternalLink, Folder, ChevronRight } from "lucide-react";

interface ClassItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  created_at: string;
  folder_id: string | null;
}
interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
}

export default function ClassesList() {
  const { subjectSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get("state") || "";
  const folderParam = searchParams.get("folder");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<FolderItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: subject } = await supabase
        .from("subjects").select("id, name").eq("slug", subjectSlug).maybeSingle();
      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      let query = supabase.from("classes")
        .select("id, title, description, video_url, duration_minutes, created_at, folder_id")
        .eq("subject_id", subject.id).eq("is_published", true)
        .order("created_at", { ascending: false });
      if (state) query = query.in("state", [state, "both"]);

      const [{ data }, { data: foldersData }] = await Promise.all([
        query,
        supabase.from("folders")
          .select("id, name, parent_id, kind, subject_id")
          .eq("subject_id", subject.id).eq("kind", "class"),
      ]);
      setClasses(data || []);
      setFolders((foldersData as FolderItem[]) || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug, state]);

  useEffect(() => {
    if (!folderParam) { setPath([]); return; }
    const map = new Map(folders.map(f => [f.id, f]));
    const stack: FolderItem[] = [];
    let cur = map.get(folderParam);
    while (cur) { stack.unshift(cur); cur = cur.parent_id ? map.get(cur.parent_id) : undefined; }
    setPath(stack);
  }, [folderParam, folders]);

  const currentFolder = path[path.length - 1] || null;
  const subFolders = folders.filter(f => (f.parent_id || null) === (currentFolder?.id || null));
  const currentClasses = classes.filter(c => (c.folder_id || null) === (currentFolder?.id || null));

  const goToFolder = (id: string | null) => {
    const sp: Record<string, string> = {};
    if (state) sp.state = state;
    if (id) sp.folder = id;
    setSearchParams(sp);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to={`/subject/${subjectSlug}${state ? `?state=${state}` : ""}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" /><span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">{subjectName} Classes</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">{classes.length} classes total</p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {(path.length > 0 || subFolders.length > 0) && (
          <div className="bg-card rounded-2xl p-2 shadow-card border border-border/50 flex items-center gap-1 flex-wrap text-sm overflow-x-auto">
            <button onClick={() => goToFolder(null)} className={`px-2 py-1 rounded-lg font-semibold ${path.length === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>📁 All</button>
            {path.map((f, i) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <button onClick={() => goToFolder(f.id)} className={`px-2 py-1 rounded-lg font-semibold ${i === path.length - 1 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{f.name}</button>
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <>
            {subFolders.map((f, i) => {
              const count = classes.filter(c => c.folder_id === f.id).length;
              const subCount = folders.filter(x => x.parent_id === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => goToFolder(f.id)}
                  className="w-full animate-slide-up bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all flex items-center gap-3 text-left"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-sm text-foreground truncate">{f.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{count} classes · {subCount} folders</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}

            {currentClasses.length === 0 && subFolders.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-heading font-semibold text-foreground">No classes yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
              </div>
            ) : currentClasses.map((cls, i) => (
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
            ))}
          </>
        )}
      </div>
    </div>
  );
}
