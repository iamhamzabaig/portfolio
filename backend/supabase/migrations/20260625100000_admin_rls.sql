-- ============================================================
-- Lock writes to a single admin identity.
--
-- The earlier RLS used `to authenticated using (true)`, so ANY logged-in
-- account could mutate site data. On hosted Supabase email signup is on by
-- default, meaning a stranger could self-register and edit the site. This
-- migration replaces every write policy with an `is_admin()` check so only the
-- designated admin can write — independent of whether public signup is open.
--
-- Admin identity = the email claim on the Supabase-signed (untamperable) JWT.
-- >>> CHANGE the email below to the address you log into /admin with. <<<
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select auth.jwt() ->> 'email') = 'hamzamunawar.webdev@gmail.com',
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- projects: public read stays; writes admin-only
-- ============================================================
drop policy if exists "projects admin insert" on public.projects;
drop policy if exists "projects admin update" on public.projects;
drop policy if exists "projects admin delete" on public.projects;

create policy "projects admin insert"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy "projects admin update"
  on public.projects for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "projects admin delete"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- contact_messages: public insert stays; read/update/delete admin-only
-- ============================================================
drop policy if exists "contact admin read" on public.contact_messages;
drop policy if exists "contact admin update" on public.contact_messages;
drop policy if exists "contact admin delete" on public.contact_messages;

create policy "contact admin read"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact admin update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "contact admin delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- profile: public read stays; update admin-only
-- ============================================================
drop policy if exists "profile admin update" on public.profile;

create policy "profile admin update"
  on public.profile for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- storage (project-images): public read stays; writes admin-only
-- ============================================================
drop policy if exists "project-images admin insert" on storage.objects;
drop policy if exists "project-images admin update" on storage.objects;
drop policy if exists "project-images admin delete" on storage.objects;

create policy "project-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and public.is_admin());

create policy "project-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());

create policy "project-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin());
