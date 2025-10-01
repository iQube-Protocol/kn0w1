-- Phase 1b: Uber Admin System Schema

-- 1. Enhance agent_sites table with naming and master flag
ALTER TABLE agent_sites
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS brand_identity jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_master boolean DEFAULT false;

-- Set default display_name from title for existing sites
UPDATE agent_sites SET display_name = title WHERE display_name IS NULL;

-- Make display_name required going forward
ALTER TABLE agent_sites ALTER COLUMN display_name SET NOT NULL;

-- Create index for master site lookup
CREATE INDEX IF NOT EXISTS idx_agent_sites_is_master ON agent_sites(is_master) WHERE is_master = true;

-- 2. Create master_site_updates table for update propagation
CREATE TABLE IF NOT EXISTS master_site_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site_id uuid REFERENCES agent_sites(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  target_sites uuid[] DEFAULT '{}'::uuid[],
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  pushed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  notes text
);

ALTER TABLE master_site_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uber admins can manage master updates"
ON master_site_updates FOR ALL
USING (is_mm_super_admin(auth.uid()));

CREATE POLICY "Site admins can view relevant updates"
ON master_site_updates FOR SELECT
USING (has_min_role(source_site_id, 'super_admin'::admin_role) OR auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_master_site_updates_status ON master_site_updates(status);
CREATE INDEX IF NOT EXISTS idx_master_site_updates_source ON master_site_updates(source_site_id);

-- 3. Add site_slug unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_sites_site_slug ON agent_sites(site_slug);

-- 4. Update role_rank function to include uber_admin
CREATE OR REPLACE FUNCTION public.role_rank(r admin_role)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  select case r
    when 'uber_admin' then 10
    when 'super_admin' then 5
    when 'content_admin' then 4
    when 'social_admin' then 3
    when 'moderator' then 2
  end;
$$;

-- 5. Create helper function to check if user is uber admin
CREATE OR REPLACE FUNCTION public.is_uber_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN is_mm_super_admin(uid);
END;
$$;

-- 6. Update agent_sites RLS policies to support uber admins
DROP POLICY IF EXISTS "agent_sites_select" ON agent_sites;
CREATE POLICY "agent_sites_select" ON agent_sites FOR SELECT
USING (
  is_uber_admin(auth.uid())
  OR owner_user_id = auth.uid() 
  OR has_min_role(id, 'moderator'::admin_role)
);

DROP POLICY IF EXISTS "agent_sites_update" ON agent_sites;
CREATE POLICY "agent_sites_update" ON agent_sites FOR UPDATE
USING (
  is_uber_admin(auth.uid())
  OR owner_user_id = auth.uid() 
  OR has_min_role(id, 'super_admin'::admin_role)
)
WITH CHECK (
  is_uber_admin(auth.uid())
  OR owner_user_id = auth.uid() 
  OR has_min_role(id, 'super_admin'::admin_role)
);

DROP POLICY IF EXISTS "agent_sites_delete" ON agent_sites;
CREATE POLICY "agent_sites_delete" ON agent_sites FOR DELETE
USING (is_uber_admin(auth.uid()));

-- 7. Create audit trigger for master_site_updates
CREATE TRIGGER update_master_site_updates_updated_at
BEFORE UPDATE ON master_site_updates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();