-- Single profile row. Mirrors the frontend fallback content so local dev renders
-- the real site, not placeholder text.
insert into public.profile (id, name, role, headline, bio, location, email, phone, socials, resume_url, stats)
values (
  1,
  'Hamza Munawar',
  'Full-Stack JavaScript Engineer',
  'I build scalable enterprise ERP modules, real-time apps, and high-performance frontends — in Angular, React, and Node.',
  'Performance-driven full-stack JavaScript developer with 3+ years shipping enterprise ERP modules, real-time platforms, and fast frontend architectures. I work across Angular (v13–v20), React/Next.js, and Node/Express inside Nx monorepos — turning legacy monoliths into measurable wins on speed, bundle size, and developer workflow.',
  'Islamabad, Pakistan',
  'hamzamunawar.webdev@gmail.com',
  '+92 344-2971754',
  '{"github": "https://github.com/iamhamzabaig", "linkedin": "https://linkedin.com/in/iamhamzabaig-in"}',
  '',
  '[
    {"label": "Faster Pipeline", "value": "85", "suffix": "%", "description": "SSR PDF invoices: 8s -> 1.2s", "eyebrow": "OPTIMIZED", "spark": [8,7,7,5,4,3,2,1]},
    {"label": "Lighthouse Score", "value": "88", "suffix": "", "description": "up from 65, -30% bundle", "eyebrow": "NG 13 -> 20", "spark": [3,4,4,5,6,7,8,9]},
    {"label": "Employees Served", "value": "120", "suffix": "+", "description": "attendance + timesheet platform", "eyebrow": "CODE AGRIUS", "spark": [1,2,3,4,6,7,8,9]},
    {"label": "ERP Modules", "value": "6", "suffix": "", "description": "CRM, HR, Inventory, Sales, Reporting, Admin", "eyebrow": "NX MONOREPO", "spark": [2,4,3,6,5,7,6,8]}
  ]'::jsonb
)
on conflict (id) do nothing;

-- Sample projects (slug auto-derived from title by trigger).
insert into public.projects (title, description, content, tags, featured, sort_order)
values
  ('Oreius Voting App', 'Real-time, event-driven internal voting platform with optimistic UI and live aggregation.',
   'Built for live events: votes stream over Socket.io and aggregate in real time.', '{"React","Express","MongoDB","Socket.io"}', true, 1),
  ('Bitcyllionaire', 'Crypto portfolio tracker with live GraphQL price sync and Stripe subscription billing.',
   'GraphQL subscriptions for live price sync, Zustand client state, end-to-end Stripe billing.', '{"React","GraphQL","Apollo","Zustand","Stripe"}', true, 2)
on conflict (slug) do nothing;
