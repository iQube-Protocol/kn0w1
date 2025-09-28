-- Step 3: Create remaining tables and update existing ones
create table if not exists utilities_config (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  content_creation_on boolean not null default true,
  teaching_on boolean not null default false,
  commercial_on boolean not null default false,
  social_on boolean not null default true,
  teaching_opts_json jsonb not null default '{}'::jsonb,
  commercial_opts_json jsonb not null default '{}'::jsonb,
  social_opts_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(agent_site_id)
);
create trigger trg_utilities_config_updated_at
before update on utilities_config
for each row execute function set_updated_at();

-- CRM tables
create table if not exists crm_profiles (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  user_id uuid,
  email text,
  handle text,
  segments text[] not null default '{}',
  consents_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_crm_profiles_site on crm_profiles(agent_site_id);
create index if not exists idx_crm_profiles_email on crm_profiles(email);

create table if not exists crm_interactions (
  id uuid primary key default gen_random_uuid(),
  agent_site_id uuid not null references agent_sites(id) on delete cascade,
  profile_id uuid references crm_profiles(id) on delete set null,
  kind text not null,
  item_id uuid,
  pillar_id uuid,
  score_delta int not null default 0,
  data_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists idx_crm_interactions_site on crm_interactions(agent_site_id);

-- Update existing tables to add agent_site_id
alter table content_categories add column if not exists agent_site_id uuid;
alter table content_categories add column if not exists pillar_id uuid;

alter table content_items add column if not exists agent_site_id uuid;
alter table content_items add column if not exists pillar_id uuid;
alter table content_items add column if not exists social_source text;
alter table content_items add column if not exists social_url text;
alter table content_items add column if not exists social_embed_html text;
alter table content_items add column if not exists accessibility_json jsonb not null default '{}'::jsonb;
alter table content_items add column if not exists analytics_json jsonb not null default '{}'::jsonb;
alter table content_items add column if not exists iqube_policy_json jsonb;
alter table content_items add column if not exists contentQube_id text;
alter table content_items add column if not exists tokenQube_ref text;

alter table media_assets add column if not exists kind media_kind;
alter table media_assets add column if not exists oembed_html text;

alter table user_roles add column if not exists agent_site_id uuid;
alter table audit_logs add column if not exists agent_site_id uuid;