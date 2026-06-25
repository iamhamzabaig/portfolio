-- Extra profile fields the frontend renders but the initial schema lacked:
-- contact details, a display role, and the "by the numbers" stats band.
alter table public.profile
  add column if not exists email    text,
  add column if not exists phone    text,
  add column if not exists location text,
  add column if not exists role     text,
  add column if not exists stats    jsonb not null default '[]'::jsonb;
