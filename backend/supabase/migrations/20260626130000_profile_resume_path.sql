-- Track the storage path of the uploaded résumé so replacing it can delete the
-- previous file (keeps storage from accumulating old résumés). The public URL
-- stays in resume_url; resume_path is the object key in the project-images bucket.
alter table public.profile
  add column if not exists resume_path text;
