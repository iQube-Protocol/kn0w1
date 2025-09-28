-- Step 4: Create functions with correct admin_role values
create or replace function role_rank(r admin_role)
returns int
language sql
immutable
set search_path = public
as $$
  select case r
    when 'super_admin' then 5
    when 'content_admin' then 4
    when 'social_admin' then 3
    when 'moderator' then 2
  end;
$$;

create or replace function role_rank(r role_type)
returns int
language sql
immutable
set search_path = public
as $$
  select case r
    when 'super_admin' then 5
    when 'content_admin' then 4
    when 'social_admin' then 3
    when 'moderator' then 2
    when 'member' then 1
  end;
$$;

create or replace function user_role_rank(p_agent_site_id uuid, uid uuid default auth.uid())
returns int
language sql
stable
set search_path = public
as $$
  select coalesce(max(role_rank(ur.role)), 0)
  from user_roles ur
  where ur.agent_site_id = p_agent_site_id
    and ur.user_id = uid;
$$;

create or replace function has_min_role(p_agent_site_id uuid, min_role admin_role, uid uuid default auth.uid())
returns boolean
language sql
stable
set search_path = public
as $$
  select user_role_rank(p_agent_site_id, uid) >= role_rank(min_role);
$$;

create or replace function is_mm_super_admin(uid uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare uemail text;
begin
  select email into uemail from auth.users where id = uid;
  return exists (
    select 1 from mm_super_admins s
    where s.user_id = uid
       or (s.email is not null and s.email = uemail)
  );
end;
$$;

-- Enable RLS on new tables
alter table mm_super_admins enable row level security;
alter table agent_sites enable row level security;
alter table aigents enable row level security;
alter table agent_branches enable row level security;
alter table mission_pillars enable row level security;
alter table utilities_config enable row level security;
alter table crm_profiles enable row level security;
alter table crm_interactions enable row level security;