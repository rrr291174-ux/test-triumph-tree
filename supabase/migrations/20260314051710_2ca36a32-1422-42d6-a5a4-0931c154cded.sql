
-- Table to store approved/unlocked users (added by admin)
CREATE TABLE public.approved_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  approved_by uuid,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.approved_users ENABLE ROW LEVEL SECURITY;

-- Admins can manage approved users
CREATE POLICY "Admins can manage approved_users"
  ON public.approved_users
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can check their own approval
CREATE POLICY "Users can view own approval"
  ON public.approved_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
