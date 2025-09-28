-- Step 2: Create remaining core tables
create table if not exists aigents (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  name text not null,
  agent_kind agent_kind not null default 'custom',
  is_system_agent boolean not null default false,
  is_mutable boolean not null default true,
  system_prompt_md text not null default '',
  runtime_prefs_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aigents_site on aigents(agent_site_id);
create trigger trg_aigents_updated_at
before update on aigents
for each row execute function set_updated_at();

-- Agent branches
create table if not exists agent_branches (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  kind branch_kind not null,
  display_name text not null,
  short_summary text,
  long_context_md text,
  values_json jsonb not null default '[]'::jsonb,
  tone text,
  audience text,
  safety_notes_md text,
  system_prompt_template_md text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(agent_site_id, kind)
);

create index if not exists idx_agent_branches_site on agent_branches(agent_site_id);
create trigger trg_agent_branches_updated_at
before update on agent_branches
for each row execute function set_updated_at();

-- Mission pillars
create table if not exists mission_pillars (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  display_name text not null,
  short_summary text,
  long_context_md text,
  goals_json jsonb not null default '[]'::jsonb,
  kpis_json jsonb not null default '[]'::jsonb,
  default_utilities_json jsonb not null default '{}'::jsonb,
  iqube_policy_json jsonb,
  contentQube_id text,
  tokenQube_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mission_pillars_site on mission_pillars(agent_site_id);
create trigger trg_mission_pillars_updated_at
before update on mission_pillars
for each row execute function set_updated_at();