-- ============================================================
-- Onde Eu Começo? — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null default '',
  role text not null default 'user' check (role in ('user', 'organization', 'admin')),
  location text,
  avatar_url text,
  bio text,
  phone text,
  birth_date date,
  onboarding_completed boolean not null default false,
  progress integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add birth_date if running on existing database
alter table public.profiles add column if not exists birth_date date;

-- ── USER ONBOARDING ───────────────────────────────────────
create table if not exists public.user_onboarding (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  objective text,
  difficulties text[] not null default '{}',
  skills text[] not null default '{}',
  availability text,
  victory_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── ORGANIZATIONS ─────────────────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('empresa', 'instituicao')),
  description text,
  logo_url text,
  website text,
  location text,
  category text,
  employees_count text,
  founded_year integer,
  plan text not null default 'gratuito' check (plan in ('gratuito', 'profissional', 'empresarial')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── OPPORTUNITIES ─────────────────────────────────────────
create table if not exists public.opportunities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  category text not null check (category in ('bolsa', 'emprego', 'curso', 'programa', 'voluntariado')),
  modality text not null check (modality in ('presencial', 'remoto', 'hibrido')),
  location text,
  requirements text[] not null default '{}',
  skills_required text[] not null default '{}',
  objectives_match text[] not null default '{}',
  deadline date,
  vacancies integer,
  status text not null default 'ativo' check (status in ('ativo', 'pausado', 'encerrado')),
  image_url text,
  is_free boolean not null default true,
  salary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_category_idx on public.opportunities(category);
create index if not exists opportunities_status_idx on public.opportunities(status);
create index if not exists opportunities_org_idx on public.opportunities(org_id);

-- ── APPLICATIONS ──────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  status text not null default 'interesse' check (status in ('interesse', 'inscrito', 'em_analise', 'aprovado', 'recusado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, opportunity_id)
);

create index if not exists applications_user_idx on public.applications(user_id);
create index if not exists applications_opp_idx on public.applications(opportunity_id);

-- ── SAVED OPPORTUNITIES ───────────────────────────────────
create table if not exists public.saved_opportunities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, opportunity_id)
);

-- ── NOTIFICATIONS ─────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id);

-- ── UPDATED_AT TRIGGERS ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger organizations_updated_at before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger opportunities_updated_at before update on public.opportunities
  for each row execute procedure public.handle_updated_at();

create trigger applications_updated_at before update on public.applications
  for each row execute procedure public.handle_updated_at();

create trigger user_onboarding_updated_at before update on public.user_onboarding
  for each row execute procedure public.handle_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ROW LEVEL SECURITY ────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.user_onboarding enable row level security;
alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_select_public" on public.profiles for select using (true);

-- user_onboarding
create policy "onboarding_own" on public.user_onboarding for all using (auth.uid() = user_id);

-- organizations — owners manage, public read
create policy "orgs_public_read" on public.organizations for select using (true);
create policy "orgs_insert_own" on public.organizations for insert with check (auth.uid() = user_id);
create policy "orgs_update_own" on public.organizations for update using (auth.uid() = user_id);
create policy "orgs_delete_own" on public.organizations for delete using (auth.uid() = user_id);

-- opportunities — public read active, org owners manage own
create policy "opps_public_read" on public.opportunities for select using (status = 'ativo');
create policy "opps_org_read_all" on public.opportunities for select using (
  org_id in (select id from public.organizations where user_id = auth.uid())
);
create policy "opps_org_insert" on public.opportunities for insert with check (
  org_id in (select id from public.organizations where user_id = auth.uid())
);
create policy "opps_org_update" on public.opportunities for update using (
  org_id in (select id from public.organizations where user_id = auth.uid())
);
create policy "opps_org_delete" on public.opportunities for delete using (
  org_id in (select id from public.organizations where user_id = auth.uid())
);

-- applications — users own their applications, orgs see applicants to their opps
create policy "apps_own" on public.applications for all using (auth.uid() = user_id);
create policy "apps_org_view" on public.applications for select using (
  opportunity_id in (
    select o.id from public.opportunities o
    join public.organizations org on o.org_id = org.id
    where org.user_id = auth.uid()
  )
);

-- saved opportunities
create policy "saved_own" on public.saved_opportunities for all using (auth.uid() = user_id);

-- notifications
create policy "notifs_own" on public.notifications for all using (auth.uid() = user_id);

-- ── SEED DATA ─────────────────────────────────────────────
-- Demo organizations (will be owned by first admin user — update user_id after creating admin)
-- Run seed after creating admin user and replace 'ADMIN_USER_ID' with actual UUID
