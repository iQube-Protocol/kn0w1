-- Step 1: Create new enums and basic tables first
create type role_type as enum ('super_admin','content_admin','social_admin','moderator','member');
create type branch_kind as enum ('mythos','logos');
create type agent_kind as enum ('satoshi','knyt','custom');
create type media_kind as enum ('audio','video','text','pdf','image','mixed');
create type status_type as enum ('draft','in_review','scheduled','published','archived');

-- Super Admins table
create table if not exists mm_super_admins (
  user_id uuid unique,
  email text unique,
  created_at timestamptz default now()
);

-- Core: Agent Sites
create table if not exists agent_sites (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  site_slug text not null unique,
  title text not null,
  status text not null default 'active',
  branding_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_sites_owner on agent_sites(owner_user_id);

-- Updated_at helper
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_agent_sites_updated_at
before update on agent_sites
for each row execute function set_updated_at();