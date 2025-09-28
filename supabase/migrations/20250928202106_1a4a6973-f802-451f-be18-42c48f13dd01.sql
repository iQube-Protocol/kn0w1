-- Step 5: Add RLS policies for new tables
-- mm_super_admins policies
create policy "Only super admins can view mm_super_admins" on mm_super_admins
for select to authenticated using (is_mm_super_admin(auth.uid()));

create policy "Only super admins can insert mm_super_admins" on mm_super_admins
for insert to authenticated with check (is_mm_super_admin(auth.uid()));

-- agent_sites policies
create policy "agent_sites_select" on agent_sites
for select to authenticated using (
  owner_user_id = auth.uid() or has_min_role(id, 'moderator'::admin_role)
);

create policy "agent_sites_insert" on agent_sites
for insert to authenticated with check (
  owner_user_id = auth.uid()
);

create policy "agent_sites_update" on agent_sites
for update to authenticated using (
  owner_user_id = auth.uid() or has_min_role(id, 'super_admin'::admin_role)
) with check (
  owner_user_id = auth.uid() or has_min_role(id, 'super_admin'::admin_role)
);

create policy "agent_sites_delete" on agent_sites
for delete to authenticated using (
  has_min_role(id, 'super_admin'::admin_role)
);

-- aigents policies
create policy "aigents_read" on aigents
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "aigents_write" on aigents
for all to authenticated using ( has_min_role(agent_site_id, 'content_admin'::admin_role) )
with check ( has_min_role(agent_site_id, 'content_admin'::admin_role) );

-- agent_branches policies
create policy "agent_branches_read" on agent_branches
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "agent_branches_write" on agent_branches
for all to authenticated using ( has_min_role(agent_site_id, 'content_admin'::admin_role) )
with check ( has_min_role(agent_site_id, 'content_admin'::admin_role) );

-- mission_pillars policies
create policy "mission_pillars_read" on mission_pillars
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "mission_pillars_write" on mission_pillars
for all to authenticated using ( has_min_role(agent_site_id, 'content_admin'::admin_role) )
with check ( has_min_role(agent_site_id, 'content_admin'::admin_role) );

-- utilities_config policies
create policy "utilities_config_read" on utilities_config
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "utilities_config_write" on utilities_config
for all to authenticated using ( has_min_role(agent_site_id, 'content_admin'::admin_role) )
with check ( has_min_role(agent_site_id, 'content_admin'::admin_role) );

-- crm_profiles policies
create policy "crm_profiles_read" on crm_profiles
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "crm_profiles_write" on crm_profiles
for all to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) )
with check ( has_min_role(agent_site_id, 'moderator'::admin_role) );

-- crm_interactions policies
create policy "crm_interactions_read" on crm_interactions
for select to authenticated using ( has_min_role(agent_site_id, 'moderator'::admin_role) );

create policy "crm_interactions_write" on crm_interactions
for all to authenticated using ( true ); -- allow server-side logging