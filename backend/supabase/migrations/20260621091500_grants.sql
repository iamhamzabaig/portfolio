-- Table privileges for the PostgREST roles (anon, authenticated, service_role).
-- RLS policies (previous migration) decide WHICH rows and commands are allowed,
-- but a role still needs base table GRANTs or PostgREST returns
-- "permission denied for table" before RLS is ever evaluated. These grants
-- mirror the RLS policy matrix (least privilege); RLS remains the row gate.

grant usage on schema public to anon, authenticated, service_role;

-- projects: public read; admin (any authenticated session) writes.
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

-- contact_messages: public insert; admin reads/updates/deletes.
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- profile: public read; admin updates.
grant select on public.profile to anon, authenticated;
grant update on public.profile to authenticated;

-- service_role bypasses RLS and needs full table access for admin/maintenance.
grant select, insert, update, delete
  on public.projects, public.contact_messages, public.profile
  to service_role;
