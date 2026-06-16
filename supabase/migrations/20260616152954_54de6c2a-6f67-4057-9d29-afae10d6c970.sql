
-- Sub-folders support
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE;
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'material';
-- kind: 'material' | 'exam' | 'class'

CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS folders_kind_idx ON public.folders(kind);

-- Folder link on exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS exams_folder_id_idx ON public.exams(folder_id);

-- Folder link on classes
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS classes_folder_id_idx ON public.classes(folder_id);
