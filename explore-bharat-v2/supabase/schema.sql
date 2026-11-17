-- Run this script in the Supabase SQL editor before enabling account features.
-- Never expose the Supabase service_role key in config.js or browser code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null check (char_length(destination) between 1 and 100),
  visited_on date,
  created_at timestamptz not null default now()
);

-- The server creates these tables too, but declaring them here documents the
-- required shape and makes Row Level Security policies available in Supabase.
create table if not exists public.bookings (
  id bigserial primary key,
  booking_reference text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  travel_date date not null,
  items jsonb not null,
  amount_paise integer not null,
  currency text not null default 'INR',
  payment_id text unique not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists public.checkout_sessions (
  id bigserial primary key,
  order_id text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  travel_date date not null,
  items jsonb not null,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null default 'created',
  payment_id text unique,
  booking_id bigint,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.travel_logs enable row level security;
alter table public.bookings enable row level security;
alter table public.checkout_sessions enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Read own travel log" on public.travel_logs;
create policy "Read own travel log" on public.travel_logs
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Add to own travel log" on public.travel_logs;
create policy "Add to own travel log" on public.travel_logs
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Update own travel log" on public.travel_logs;
create policy "Update own travel log" on public.travel_logs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "Delete from own travel log" on public.travel_logs;
create policy "Delete from own travel log" on public.travel_logs
  for delete to authenticated using (user_id = auth.uid());

-- Bookings are inserted only by the server after Razorpay signature and capture checks.
-- A signed-in user may only read bookings for their own verified email address.
drop policy if exists "Read bookings for signed-in email" on public.bookings;
create policy "Read bookings for signed-in email" on public.bookings
  for select to authenticated
  using (lower(customer_email) = lower((auth.jwt() ->> 'email')));

-- Browser clients receive no access to payment sessions.
revoke all on public.checkout_sessions from anon, authenticated;
revoke insert, update, delete on public.bookings from anon, authenticated;
grant select on public.profiles, public.travel_logs, public.bookings to authenticated;
grant insert, update, delete on public.profiles, public.travel_logs to authenticated;
