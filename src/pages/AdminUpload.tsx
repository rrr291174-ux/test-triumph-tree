import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileJson, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface QuestionJSON {
  question: string;
  options: string[];
  answer_index: number;
}

interface SubjectOption {
  id: string;
  name: string;
  slug: string;
}

export default function AdminUpload() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [jsonData, setJsonData] = useState<QuestionJSON[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("subjects").select("id, name, slug").order("display_order").then(({ data }) => {
      if (data) setSubjects(data);
    });
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <h1 className="font-heading font-bold text-xl text-foreground">Admin Access Only</h1>
      <p className="text-muted-foreground text-sm text-center">You don't have admin privileges to access this page.</p>
      <Link to="/" className="text-primary font-semibold text-sm hover:underline">← Go Home</Link>
    </div>
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
        
        // Validate structure
        for (let i = 0; i < parsed.length; i++) {
          const q = parsed[i];
          if (!q.question || !Array.isArray(q.options) || typeof q.answer_index !== "number") {
            throw new Error(`Question ${i + 1}: Missing required fields (question, options[], answer_index)`);
          }
          if (q.options.length < 2) {
            throw new Error(`Question ${i + 1}: Must have at least 2 options`);
          }
          if (q.answer_index < 0 || q.answer_index >= q.options.length) {
            throw new Error(`Question ${i + 1}: answer_index out of range`);
          }
        }
        setJsonData(parsed);
        toast({ title: "✅ JSON Valid", description: `${parsed.length} questions detected` });
      } catch (err: any) {
        setJsonData(null);
        toast({ title: "❌ Invalid JSON", description: err.message, variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!jsonData || !selectedSubject || !examTitle.trim()) {
      toast({ title: "Missing Info", description: "Please select subject and enter exam title", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Create exam
      const { data: exam, error: examErr } = await supabase
        .from("exams")
        .insert({
          subject_id: selectedSubject,
          title: examTitle.trim(),
          duration_minutes: durationMinutes,
          total_marks: jsonData.length,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (examErr) throw examErr;

      // Insert all questions
      const questions = jsonData.map((q, i) => ({
        exam_id: exam.id,
        question_text: q.question,
        options: q.options,
        answer_index: q.answer_index,
        display_order: i + 1,
      }));

      const { error: qErr } = await supabase.from("questions").insert(questions);
      if (qErr) throw qErr;

      setResult({ success: true, count: jsonData.length });
      toast({ title: "🎉 Upload Successful!", description: `${jsonData.length} questions added to "${examTitle}"` });
      
      // Reset
      setJsonData(null);
      setFileName("");
      setExamTitle("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setResult({ success: false, count: 0 });
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">🔧 Admin: Bulk Upload</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Upload JSON exam files</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Subject selector */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <label className="font-heading font-semibold text-sm text-foreground block mb-2">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="">Select Subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Exam title */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <label className="font-heading font-semibold text-sm text-foreground block mb-2">Exam Title</label>
          <input
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="e.g., Mathematics Chapter 5 Test"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        {/* Duration */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <label className="font-heading font-semibold text-sm text-foreground block mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            min={5}
            max={180}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        {/* File upload */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <label className="font-heading font-semibold text-sm text-foreground block mb-2">JSON File</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
          >
            <FileJson className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              {fileName || "Click to select JSON file"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Format: [{`{ question, options[], answer_index }`}]
            </p>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
        </div>

        {/* Preview */}
        {jsonData && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-2">
              Preview ({jsonData.length} questions)
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {jsonData.slice(0, 5).map((q, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-foreground mb-1">Q{i + 1}: {q.question.substring(0, 80)}...</p>
                  <div className="flex flex-wrap gap-1">
                    {q.options.map((opt, j) => (
                      <span key={j} className={`px-2 py-0.5 rounded-md ${j === q.answer_index ? "bg-accent/20 text-accent font-bold" : "bg-background text-muted-foreground"}`}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {jsonData.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">... and {jsonData.length - 5} more</p>
              )}
            </div>
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!jsonData || !selectedSubject || !examTitle.trim() || uploading}
          className="w-full h-12 rounded-xl font-bold text-base gap-2"
        >
          {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
          {uploading ? "Uploading..." : `Upload ${jsonData?.length || 0} Questions`}
        </Button>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl p-4 flex items-center gap-3 ${result.success ? "bg-accent/10 border border-accent/30" : "bg-destructive/10 border border-destructive/30"}`}>
            {result.success ? <CheckCircle className="h-6 w-6 text-accent" /> : <AlertCircle className="h-6 w-6 text-destructive" />}
            <div>
              <p className="font-semibold text-sm text-foreground">
                {result.success ? "Upload Complete!" : "Upload Failed"}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.success ? `${result.count} questions added successfully` : "Please try again"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
