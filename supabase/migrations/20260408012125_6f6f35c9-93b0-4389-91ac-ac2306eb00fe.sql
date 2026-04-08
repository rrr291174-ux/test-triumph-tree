
CREATE TABLE public.shorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video',
  caption TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published shorts"
ON public.shorts FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can create own shorts"
ON public.shorts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shorts"
ON public.shorts FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shorts"
ON public.shorts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all shorts"
ON public.shorts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_shorts_updated_at
BEFORE UPDATE ON public.shorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
