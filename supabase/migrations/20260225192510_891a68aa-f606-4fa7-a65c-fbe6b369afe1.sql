
-- Create folders table
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'both',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view folders" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Admins can manage folders" ON public.folders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add folder_id to materials
ALTER TABLE public.materials ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE;
