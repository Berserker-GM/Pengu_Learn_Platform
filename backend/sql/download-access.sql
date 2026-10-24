-- Apply in Supabase SQL Editor. Vercel functions use SUPABASE_SECRET_KEY for all privileged access.
create table if not exists public.download_access (
 id bigint generated always as identity primary key,
 user_id uuid references auth.users(id) on delete set null,
 email text not null,
 status text not null check(status in ('pending','approved','rejected')),
 payment_reference text,
 source text not null check(source in ('manual_upi','promo')),
 request_token_hash text,
 created_at timestamptz not null default now()
);
alter table public.download_access add column if not exists email text;
alter table public.download_access add column if not exists request_token_hash text;
alter table public.download_access alter column user_id drop not null;
create index if not exists download_access_email_created_idx on public.download_access(email,created_at desc);
create unique index if not exists download_access_token_hash_idx on public.download_access(request_token_hash) where request_token_hash is not null;
alter table public.download_access enable row level security;
revoke all on public.download_access from anon,authenticated;
grant all on public.download_access to service_role;
grant usage, select on sequence public.download_access_id_seq to service_role;
drop policy if exists "Users can read their own download access" on public.download_access;
drop function if exists public.redeem_download_promo(text);
