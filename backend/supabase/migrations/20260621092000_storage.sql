-- Public bucket for project cover images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Storage object policies, scoped to the project-images bucket.
create policy "project-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

create policy "project-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

create policy "project-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images')
  with check (bucket_id = 'project-images');

create policy "project-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');
