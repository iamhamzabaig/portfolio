-- Single profile row.
insert into public.profile (id, name, headline, bio, socials, resume_url)
values (
  1,
  'Hamza Munawar',
  'Full-Stack Developer',
  'I design and build web applications end to end.',
  '{"github": "https://github.com/", "linkedin": "https://www.linkedin.com/"}',
  ''
)
on conflict (id) do nothing;

-- Sample projects (slug auto-derived from title by trigger).
insert into public.projects (title, description, content, tags, featured, sort_order)
values
  ('Sample Project One', 'A first sample project for local development.',
   'Longer body content for project one.', '{"react","supabase"}', true, 1),
  ('Sample Project Two', 'A second sample project for local development.',
   'Longer body content for project two.', '{"node","postgres"}', false, 2);
