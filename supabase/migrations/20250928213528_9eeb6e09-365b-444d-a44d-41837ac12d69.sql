-- Create setup_drafts table to store incomplete setup progress
CREATE TABLE public.setup_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setup_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.setup_drafts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own setup drafts
CREATE POLICY "Users can manage their own setup drafts"
ON public.setup_drafts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_setup_drafts_updated_at
BEFORE UPDATE ON public.setup_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();