create table if not exists public.download_access (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 status text not null check(status in ('pending','approved','rejected')),
 payment_reference text,
 source text not null check(source in ('manual_upi','promo')),
 created_at timestamptz not null default now()
);
create index if not exists download_access_user_created_idx on public.download_access(user_id,created_at desc);
alter table public.download_access enable row level security;
revoke all on public.download_access from anon,authenticated;
grant select on public.download_access to authenticated;
grant all on public.download_access to service_role;
grant usage, select on sequence public.download_access_id_seq to service_role;
drop policy if exists "Users can read their own download access" on public.download_access;
create policy "Users can read their own download access" on public.download_access for select to authenticated using((select auth.uid())=user_id);
create or replace function public.redeem_download_promo(p_code text) returns void language plpgsql security definer set search_path='' as $$
declare current_user_id uuid := auth.uid();
begin
 if current_user_id is null then raise exception 'Sign in to redeem this code.'; end if;
 if upper(trim(coalesce(p_code,''))) <> 'PENGUNEW' then raise exception 'Invalid promo code.'; end if;
 if not exists(select 1 from public.download_access where user_id=current_user_id and status='approved') then
  insert into public.download_access(user_id,status,source) values(current_user_id,'approved','promo');
 end if;
end;
$$;
revoke all on function public.redeem_download_promo(text) from public,anon;
grant execute on function public.redeem_download_promo(text) to authenticated;
