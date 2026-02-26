
CREATE TABLE public.objections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own objections"
ON public.objections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own objections"
ON public.objections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all objections"
ON public.objections FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_objections_updated_at
BEFORE UPDATE ON public.objections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
