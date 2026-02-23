
-- Materials table for PDFs, notes, study materials
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text,
  file_type text DEFAULT 'pdf',
  is_published boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published materials" ON public.materials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage materials" ON public.materials
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Classes table for video links
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  duration_minutes integer,
  is_published boolean DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published classes" ON public.classes
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for materials
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);

CREATE POLICY "Anyone can view materials files" ON storage.objects
  FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Admins can upload materials" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete materials" ON storage.objects
  FOR DELETE USING (bucket_id = 'materials' AND has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
