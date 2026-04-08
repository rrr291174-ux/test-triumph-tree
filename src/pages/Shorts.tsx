import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Heart, MessageCircle, Share2, Upload, X, Loader2, Play, Pause, Volume2, VolumeX, Image as ImageIcon, Video } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Short {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export default function Shorts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["shorts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shorts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profiles for all shorts
      const userIds = [...new Set((data || []).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((s: any) => ({
        ...s,
        profile: profileMap.get(s.user_id) || { full_name: "User", avatar_url: null },
      }));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !user) throw new Error("No file or user");
      setUploading(true);

      const ext = uploadFile.name.split(".").pop();
      const path = `shorts/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(path, uploadFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(path);
      const mediaType = uploadFile.type.startsWith("video") ? "video" : "image";

      const { error: insertError } = await supabase.from("shorts").insert({
        user_id: user.id,
        media_url: urlData.publicUrl,
        media_type: mediaType,
        caption: caption || null,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Short uploaded!");
      queryClient.invalidateQueries({ queryKey: ["shorts"] });
      setShowUpload(false);
      setUploadFile(null);
      setCaption("");
      setUploading(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Upload failed");
      setUploading(false);
    },
  });

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const idx = Math.round(scrollTop / height);
    setCurrentIndex(idx);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-40" style={{ top: "57px", bottom: "64px" }}>
      {/* Shorts Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {shorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/60 gap-4 px-8 text-center">
            <Video className="h-16 w-16 opacity-40" />
            <p className="text-lg font-semibold">No Shorts Yet</p>
            <p className="text-sm">Be the first to upload a short video or image!</p>
          </div>
        ) : (
          shorts.map((short, index) => (
            <ShortCard key={short.id} short={short} isActive={index === currentIndex} />
          ))
        )}
      </div>

      {/* Upload FAB */}
      {user && (
        <button
          onClick={() => setShowUpload(true)}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center z-50 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            boxShadow: "0 4px 20px rgba(245,158,11,0.5)",
          }}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center px-6">
          <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="absolute top-4 right-4">
            <X className="h-6 w-6 text-white" />
          </button>

          <h2 className="text-white text-xl font-bold mb-6">Upload Short</h2>

          {!uploadFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs aspect-[9/16] rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-3 text-white/60 hover:border-amber-400 hover:text-amber-400 transition-colors"
            >
              <Upload className="h-10 w-10" />
              <span className="text-sm font-medium">Tap to select video or image</span>
              <span className="text-xs opacity-60">MP4, MOV, JPG, PNG</span>
            </button>
          ) : (
            <div className="w-full max-w-xs space-y-4">
              <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center">
                {uploadFile.type.startsWith("video") ? (
                  <video src={URL.createObjectURL(uploadFile)} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={URL.createObjectURL(uploadFile)} className="w-full h-full object-cover" alt="Preview" />
                )}
              </div>
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/40 border border-white/20 focus:border-amber-400 outline-none"
              />
              <button
                onClick={() => uploadMutation.mutate()}
                disabled={uploading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
              >
                {uploading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Upload Short"}
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setUploadFile(f);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ShortCard({ short, isActive }: { short: Short; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const initials = (short.profile?.full_name || "U")[0]?.toUpperCase();

  return (
    <div className="h-full w-full snap-start relative flex items-center justify-center" style={{ scrollSnapAlign: "start" }}>
      {short.media_type === "video" ? (
        <>
          <video
            ref={videoRef}
            src={short.media_url}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={muted}
            playsInline
            onClick={togglePlay}
          />
          {/* Play/Pause overlay */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={togglePlay}>
              <Play className="h-16 w-16 text-white/80" fill="white" />
            </div>
          )}
          {/* Mute toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center"
          >
            {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
          </button>
        </>
      ) : (
        <img src={short.media_url} className="absolute inset-0 w-full h-full object-cover" alt="Short" />
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-white text-sm font-semibold">{short.profile?.full_name || "User"}</span>
        </div>
        {short.caption && (
          <p className="text-white/90 text-sm">{short.caption}</p>
        )}
      </div>
    </div>
  );
}
