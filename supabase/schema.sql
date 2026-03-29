-- ============================================================
-- BlueCo — Database Schema
-- Run this entire file in the Supabase SQL Editor once.
-- It is safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";


-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role        as enum ('worker', 'employer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_type         as enum ('full_time', 'part_time', 'contract', 'casual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pay_type         as enum ('Hourly', 'Daily', 'Weekly', 'Monthly', 'One Time');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status       as enum ('draft', 'open', 'closed', 'filled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum (
    'pending', 'reviewed', 'shortlisted', 'rejected',
    'offered', 'accepted', 'withdrawn'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type worker_availability as enum ('available', 'busy', 'open_to_offers');
exception when duplicate_object then null; end $$;


-- ============================================================
-- REFERENCE TABLES
-- ============================================================

create table if not exists trades (
  id         serial primary key,
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id         serial primary key,
  trade_id   int references trades(id) on delete set null,
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);


-- ============================================================
-- PROFILES
-- ============================================================

-- Base profile — one row per auth user
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       user_role not null,
  full_name  text,
  avatar_url text,
  phone      text,
  location   text,
  bio        text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Worker-specific profile (1-to-1 with profiles where role = 'worker')
create table if not exists worker_profiles (
  id               uuid primary key references profiles(id) on delete cascade,
  years_experience int,
  hourly_rate      numeric(10,2),
  availability     worker_availability,
  resume_url       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Employer-specific profile (1-to-1 with profiles where role = 'employer')
create table if not exists employer_profiles (
  id           uuid primary key references profiles(id) on delete cascade,
  company_name text,
  company_size text,
  industry     text,
  website_url  text,
  verified     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ============================================================
-- WORKER JUNCTION TABLES
-- ============================================================

create table if not exists worker_trades (
  worker_id uuid not null references profiles(id) on delete cascade,
  trade_id  int  not null references trades(id)   on delete cascade,
  primary key (worker_id, trade_id)
);

create table if not exists worker_skills (
  worker_id uuid not null references profiles(id) on delete cascade,
  skill_id  int  not null references skills(id)   on delete cascade,
  primary key (worker_id, skill_id)
);


-- ============================================================
-- JOB POSTS
-- ============================================================

create table if not exists job_posts (
  id          uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references profiles(id) on delete cascade,
  trade_id    int  references trades(id) on delete set null,
  title       text not null,
  description text,
  location    text,
  job_type    job_type,
  pay_rate    numeric(12,2),
  pay_type    pay_type,
  status      job_status not null default 'open',
  starts_at   date,
  expires_at  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists job_perks (
  id          serial primary key,
  job_post_id uuid not null references job_posts(id) on delete cascade,
  perk        text not null
);

-- Skills required for a job (many-to-many)
create table if not exists job_post_skills (
  job_post_id uuid not null references job_posts(id) on delete cascade,
  skill_id    int  not null references skills(id)    on delete cascade,
  primary key (job_post_id, skill_id)
);


-- ============================================================
-- APPLICATIONS
-- ============================================================

create table if not exists applications (
  id          uuid primary key default uuid_generate_v4(),
  job_post_id uuid not null references job_posts(id) on delete cascade,
  worker_id   uuid not null references profiles(id)  on delete cascade,
  cover_note  text,
  status      application_status not null default 'pending',
  applied_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (job_post_id, worker_id)   -- one application per worker per job
);

-- Bookmarked jobs
create table if not exists saved_jobs (
  worker_id   uuid not null references profiles(id)  on delete cascade,
  job_post_id uuid not null references job_posts(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  primary key (worker_id, job_post_id)
);


-- ============================================================
-- REVIEWS
-- ============================================================

create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  job_post_id uuid references job_posts(id) on delete set null,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  constraint no_self_review check (reviewer_id <> reviewee_id)
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  type          text not null,
  title         text not null,
  body          text,
  resource_type text,
  resource_id   text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- TRIGGER — auto-create profiles row on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    (new.raw_user_meta_data->>'role')::user_role,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Drop the trigger first so this script is re-runnable
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on every table
alter table profiles          enable row level security;
alter table worker_profiles   enable row level security;
alter table employer_profiles enable row level security;
alter table worker_trades     enable row level security;
alter table worker_skills     enable row level security;
alter table trades            enable row level security;
alter table skills            enable row level security;
alter table job_posts         enable row level security;
alter table job_perks         enable row level security;
alter table job_post_skills   enable row level security;
alter table applications      enable row level security;
alter table saved_jobs        enable row level security;
alter table reviews           enable row level security;
alter table notifications     enable row level security;

-- ----------
-- profiles
-- ----------
create policy "Profiles are readable by all authenticated users"
  on profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on profiles for update to authenticated using (auth.uid() = id);

-- ----------
-- worker_profiles
-- ----------
create policy "Worker profiles are readable by all authenticated users"
  on worker_profiles for select to authenticated using (true);

create policy "Workers can insert their own worker profile"
  on worker_profiles for insert to authenticated with check (auth.uid() = id);

create policy "Workers can update their own worker profile"
  on worker_profiles for update to authenticated using (auth.uid() = id);

-- ----------
-- employer_profiles
-- ----------
create policy "Employer profiles are readable by all authenticated users"
  on employer_profiles for select to authenticated using (true);

create policy "Employers can insert their own employer profile"
  on employer_profiles for insert to authenticated with check (auth.uid() = id);

create policy "Employers can update their own employer profile"
  on employer_profiles for update to authenticated using (auth.uid() = id);

-- ----------
-- worker_trades
-- ----------
create policy "Worker trades are readable by all authenticated users"
  on worker_trades for select to authenticated using (true);

create policy "Workers can manage their own trades"
  on worker_trades for all to authenticated using (auth.uid() = worker_id);

-- ----------
-- worker_skills
-- ----------
create policy "Worker skills are readable by all authenticated users"
  on worker_skills for select to authenticated using (true);

create policy "Workers can manage their own skills"
  on worker_skills for all to authenticated using (auth.uid() = worker_id);

-- ----------
-- trades & skills (public reference data — read only)
-- ----------
create policy "Trades are readable by all authenticated users"
  on trades for select to authenticated using (true);

create policy "Skills are readable by all authenticated users"
  on skills for select to authenticated using (true);

-- ----------
-- job_posts
-- ----------
create policy "Open job posts are readable by all authenticated users"
  on job_posts for select to authenticated using (true);

create policy "Employers can create job posts"
  on job_posts for insert to authenticated
  with check (auth.uid() = employer_id);

create policy "Employers can update their own job posts"
  on job_posts for update to authenticated using (auth.uid() = employer_id);

create policy "Employers can delete their own job posts"
  on job_posts for delete to authenticated using (auth.uid() = employer_id);

-- ----------
-- job_perks
-- ----------
create policy "Job perks are readable by all authenticated users"
  on job_perks for select to authenticated using (true);

create policy "Employers can manage perks for their own jobs"
  on job_perks for all to authenticated
  using (
    exists (
      select 1 from job_posts
      where job_posts.id = job_perks.job_post_id
        and job_posts.employer_id = auth.uid()
    )
  );

-- ----------
-- job_post_skills
-- ----------
create policy "Job skills are readable by all authenticated users"
  on job_post_skills for select to authenticated using (true);

create policy "Employers can manage skills for their own jobs"
  on job_post_skills for all to authenticated
  using (
    exists (
      select 1 from job_posts
      where job_posts.id = job_post_skills.job_post_id
        and job_posts.employer_id = auth.uid()
    )
  );

-- ----------
-- applications
-- ----------
create policy "Workers can view their own applications"
  on applications for select to authenticated
  using (auth.uid() = worker_id);

create policy "Employers can view applications for their jobs"
  on applications for select to authenticated
  using (
    exists (
      select 1 from job_posts
      where job_posts.id = applications.job_post_id
        and job_posts.employer_id = auth.uid()
    )
  );

create policy "Workers can submit applications"
  on applications for insert to authenticated
  with check (auth.uid() = worker_id);

create policy "Workers can update their own applications"
  on applications for update to authenticated
  using (auth.uid() = worker_id);

create policy "Employers can update application status for their jobs"
  on applications for update to authenticated
  using (
    exists (
      select 1 from job_posts
      where job_posts.id = applications.job_post_id
        and job_posts.employer_id = auth.uid()
    )
  );

create policy "Workers can delete their own applications"
  on applications for delete to authenticated
  using (auth.uid() = worker_id);

-- ----------
-- saved_jobs
-- ----------
create policy "Workers can manage their own saved jobs"
  on saved_jobs for all to authenticated using (auth.uid() = worker_id);

-- ----------
-- reviews
-- ----------
create policy "Reviews are readable by all authenticated users"
  on reviews for select to authenticated using (true);

create policy "Authenticated users can leave reviews"
  on reviews for insert to authenticated
  with check (auth.uid() = reviewer_id);

-- ----------
-- notifications
-- ----------
create policy "Users can view their own notifications"
  on notifications for select to authenticated using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update to authenticated using (auth.uid() = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete to authenticated using (auth.uid() = user_id);

-- Allow the trigger function (security definer) to insert notifications
create policy "System can insert notifications"
  on notifications for insert to authenticated
  with check (true);
