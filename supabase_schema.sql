-- 1. Create Tenants Table (Stores Company Config)
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  spreadsheet_id text not null, -- The Google Sheet ID for this company
  sheet_name text default 'Base_looker',
  geral_sheet_id text, -- Optional: Second sheet ID if needed
  geral_sheet_name text default 'Geral',
  theme_color text default 'violet',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Profiles Table (Links User -> Tenant)
create table public.profiles (
  id uuid references auth.users not null primary key, -- Matches Supabase Auth ID
  tenant_id uuid references public.tenants not null,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (Row Level Security)
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;

-- 4. Policies
-- PROFILES: Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- TENANTS: Users can view the tenant they belong to
create policy "Users can view their own tenant"
  on public.tenants for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.tenant_id = tenants.id
      and profiles.id = auth.uid()
    )
  );

-- 5. Insert Demo Data (Optional - Run this to test)
-- insert into public.tenants (name, spreadsheet_id, theme_color)
-- values ('KNN Pires do Rio', '1Du9r4VGTNoI3Ynn5Nvd4IpIf39YauVoMeb1PuZjE4EY', 'violet');
