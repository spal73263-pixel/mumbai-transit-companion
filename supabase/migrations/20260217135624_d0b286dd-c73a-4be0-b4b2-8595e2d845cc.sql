
-- Create login_logs table to track sign-in history
CREATE TABLE public.login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  display_name text,
  signed_in_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text
);

-- Enable RLS
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own login history
CREATE POLICY "Users can view own login logs"
  ON public.login_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own login logs
CREATE POLICY "Users can insert own login logs"
  ON public.login_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all login logs
CREATE POLICY "Admins can view all login logs"
  ON public.login_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
