import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApproval } from "@/hooks/useApproval";
import { LockedContent } from "@/components/LockedContent";
import { ArrowLeft, BookOpen, FileText, Loader2, ExternalLink, Folder, FolderOpen } from "lucide-react";

interface FolderItem {
  id: string;
  name: string;
  subject_id: string;
  state: string;
  created_at: string;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  folder_id: string | null;
  created_at: string;
}

export default function MaterialList() {
  const { subjectSlug } = useParams();
  const [searchParams] = useSearchParams();
  const state = searchParams.get("state") || "";
  const { isApproved, loading: approvalLoading } = useApproval();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: subject } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("slug", subjectSlug)
        .maybeSingle();

      if (!subject) { setLoading(false); return; }
      setSubjectName(subject.name);

      // Fetch folders
      let folderQuery = supabase
        .from("folders")
        .select("id, name, subject_id, state, created_at")
        .eq("subject_id", subject.id)
        .order("created_at", { ascending: false });

      if (state) {
        folderQuery = folderQuery.in("state", [state, "both"]);
      }

      const { data: folderData } = await folderQuery;
      setFolders(folderData || []);

      // Fetch all materials for this subject
      let matQuery = supabase
        .from("materials")
        .select("id, title, description, file_url, file_type, folder_id, created_at")
        .eq("subject_id", subject.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (state) {
        matQuery = matQuery.in("state", [state, "both"]);
      }

      const { data } = await matQuery;
      setMaterials(data || []);
      setLoading(false);
    };
    fetch();
  }, [subjectSlug, state]);

  const folderMaterials = selectedFolder
    ? materials.filter(m => m.folder_id === selectedFolder.id)
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        {selectedFolder ? (
          <button onClick={() => setSelectedFolder(null)} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Folders</span>
          </button>
        ) : (
          <Link to={`/subject/${subjectSlug}${state ? `?state=${state}` : ""}`} className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        )}
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">
          {selectedFolder ? selectedFolder.name : `${subjectName} Material`}
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {selectedFolder ? `${folderMaterials.length} files` : `${folders.length} folders`}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : selectedFolder ? (
          /* ── Files inside folder ── */
          folderMaterials.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-semibold text-foreground">No files yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          ) : (
            folderMaterials.map((mat, i) => (
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
          )
        ) : (
          /* ── Folder list ── */
          folders.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-semibold text-foreground">No folders yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          ) : (
            folders.map((folder, i) => {
              const count = materials.filter(m => m.folder_id === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder)}
                  className="animate-slide-up w-full text-left bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-all hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <FolderOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm text-foreground truncate">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{count} files</p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0 rotate-180" />
                  </div>
                </button>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
