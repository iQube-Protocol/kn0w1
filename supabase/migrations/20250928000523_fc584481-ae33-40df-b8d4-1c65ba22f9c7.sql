-- Fix security issues - Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Update RLS policies to require authentication for admin functions
DROP POLICY IF EXISTS "Content admins can manage categories" ON public.content_categories;
CREATE POLICY "Content admins can manage categories"
  ON public.content_categories
  FOR ALL
  TO authenticated
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

DROP POLICY IF EXISTS "Content admins can manage content" ON public.content_items;
CREATE POLICY "Content admins can manage content"
  ON public.content_items
  FOR ALL
  TO authenticated
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

DROP POLICY IF EXISTS "Content admins can manage media assets" ON public.media_assets;
CREATE POLICY "Content admins can manage media assets"
  ON public.media_assets
  FOR ALL
  TO authenticated
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'content_admin')
  );

DROP POLICY IF EXISTS "Social admins can manage connections" ON public.social_connections;
CREATE POLICY "Social admins can manage connections"
  ON public.social_connections
  FOR ALL
  TO authenticated
  USING (
    public.has_admin_role(auth.uid(), 'super_admin') OR 
    public.has_admin_role(auth.uid(), 'social_admin')
  );

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_any_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_admin_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);