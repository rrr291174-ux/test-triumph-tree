
-- Add state column to materials table
ALTER TABLE public.materials ADD COLUMN state text DEFAULT 'both';

-- Add state column to classes table  
ALTER TABLE public.classes ADD COLUMN state text DEFAULT 'both';
