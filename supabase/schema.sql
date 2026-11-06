-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Roles: "viewer" = Sadiya's shared account (read only), "admin" = you (can edit + upload).

-- ---------- admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
alter table public.admins force row level security;
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());
revoke all on public.admins from anon;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- site content (all your text + photo/voice PATHS, no files) ----------
create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
alter table public.site_content force row level security;
drop policy if exists "content read" on public.site_content;
drop policy if exists "content insert admin" on public.site_content;
drop policy if exists "content update admin" on public.site_content;
create policy "content read" on public.site_content
  for select to authenticated using (true);
create policy "content insert admin" on public.site_content
  for insert to authenticated with check (public.is_admin());
create policy "content update admin" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.site_content from anon;

-- ---------- gift progress (per signed-in user) ----------
create table if not exists public.gift_progress (
  user_id   uuid not null references auth.users(id) on delete cascade,
  gift_id   smallint not null check (gift_id between 1 and 12),
  opened_at timestamptz not null default now(),
  primary key (user_id, gift_id)
);
alter table public.gift_progress enable row level security;
alter table public.gift_progress force row level security;
drop policy if exists "own rows select" on public.gift_progress;
drop policy if exists "own rows insert" on public.gift_progress;
drop policy if exists "own rows delete" on public.gift_progress;
create policy "own rows select" on public.gift_progress for select to authenticated using (auth.uid() = user_id);
create policy "own rows insert" on public.gift_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "own rows delete" on public.gift_progress for delete to authenticated using (auth.uid() = user_id);
revoke all on public.gift_progress from anon;

-- ---------- private file storage (photos + voice) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-media', 'private-media', false, 52428800,
        array['image/jpeg','image/webp','image/png','audio/mpeg','audio/mp4','audio/webm','audio/ogg','video/mp4','video/webm'])
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists "media read" on storage.objects;
drop policy if exists "media insert admin" on storage.objects;
drop policy if exists "media update admin" on storage.objects;
drop policy if exists "media delete admin" on storage.objects;
create policy "media read" on storage.objects
  for select to authenticated using (bucket_id = 'private-media');
create policy "media insert admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'private-media' and public.is_admin());
create policy "media update admin" on storage.objects
  for update to authenticated using (bucket_id = 'private-media' and public.is_admin());
create policy "media delete admin" on storage.objects
  for delete to authenticated using (bucket_id = 'private-media' and public.is_admin());

-- ---------- AFTER creating your admin user in Authentication -> Users, run: ----------
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';
