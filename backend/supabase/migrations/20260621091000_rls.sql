-- ============================================================
-- projects: public read, admin (authenticated) write
-- ============================================================
alter table public.projects enable row level security;

create policy "projects public read"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "projects admin insert"
  on public.projects for insert
  to authenticated
  with check (true);

create policy "projects admin update"
  on public.projects for update
  to authenticated
  using (true) with check (true);

create policy "projects admin delete"
  on public.projects for delete
  to authenticated
  using (true);

-- ============================================================
-- contact_messages: public insert, admin read/update/delete
-- (no anon select policy -> anon cannot read messages back)
-- ============================================================
alter table public.contact_messages enable row level security;

create policy "contact public insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact admin read"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "contact admin update"
  on public.contact_messages for update
  to authenticated
  using (true) with check (true);

create policy "contact admin delete"
  on public.contact_messages for delete
  to authenticated
  using (true);

-- ============================================================
-- profile: public read, admin update
-- ============================================================
alter table public.profile enable row level security;

create policy "profile public read"
  on public.profile for select
  to anon, authenticated
  using (true);

create policy "profile admin update"
  on public.profile for update
  to authenticated
  using (true) with check (true);
