-- Add audit trail for role changes
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  role text NOT NULL,
  agent_site_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs for their site
CREATE POLICY "Admins can view role audit logs"
ON public.role_audit_log
FOR SELECT
USING (
  has_min_role(agent_site_id, 'super_admin'::admin_role) OR
  is_mm_super_admin(auth.uid())
);

-- System can insert audit logs
CREATE POLICY "System can insert role audit logs"
ON public.role_audit_log
FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_role_audit_log_target_user ON public.role_audit_log(target_user_id);
CREATE INDEX idx_role_audit_log_agent_site ON public.role_audit_log(agent_site_id);

-- Create function to log role changes automatically
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.role_audit_log (
      user_id,
      target_user_id,
      action,
      role,
      agent_site_id,
      details
    ) VALUES (
      COALESCE(NEW.created_by, auth.uid()),
      NEW.user_id,
      'assigned',
      NEW.role::text,
      NEW.agent_site_id,
      jsonb_build_object('role_id', NEW.id)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.role_audit_log (
      user_id,
      target_user_id,
      action,
      role,
      agent_site_id,
      details
    ) VALUES (
      auth.uid(),
      OLD.user_id,
      'removed',
      OLD.role::text,
      OLD.agent_site_id,
      jsonb_build_object('role_id', OLD.id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger to user_roles table
DROP TRIGGER IF EXISTS user_roles_audit_trigger ON public.user_roles;
CREATE TRIGGER user_roles_audit_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();