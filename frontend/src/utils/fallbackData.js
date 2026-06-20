// Static portfolio content for Hamza Munawar. Used as the render source whenever
// the API has no data yet (fresh deploy) or is unreachable, so the public site is
// never empty. The admin/API can override profile + projects at runtime.

export const fallbackProfile = {
  name: 'Hamza Munawar',
  role: 'Full-Stack JavaScript Engineer',
  headline:
    'I build scalable enterprise ERP modules, real-time apps, and high-performance frontends — in Angular, React, and Node.',
  bio: 'Performance-driven full-stack JavaScript developer with 3+ years shipping enterprise ERP modules, real-time platforms, and fast frontend architectures. I work across Angular (v13–v20), React/Next.js, and Node/Express inside Nx monorepos — turning legacy monoliths into measurable wins on speed, bundle size, and developer workflow.',
  location: 'Islamabad, Pakistan',
  email: 'hamzamunawar.webdev@gmail.com',
  phone: '+92 344-2971754',
  // The signature "by the numbers" band. spark = tiny sparkline y-values (0..10).
  stats: [
    {
      label: 'Faster Pipeline',
      value: '85',
      suffix: '%',
      description: 'SSR PDF invoices: 8s → 1.2s',
      eyebrow: 'OPTIMIZED',
      spark: [8, 7, 7, 5, 4, 3, 2, 1]
    },
    {
      label: 'Lighthouse Score',
      value: '88',
      suffix: '',
      description: 'up from 65, −30% bundle',
      eyebrow: 'NG 13 → 20',
      spark: [3, 4, 4, 5, 6, 7, 8, 9]
    },
    {
      label: 'Employees Served',
      value: '120',
      suffix: '+',
      description: 'attendance + timesheet platform',
      eyebrow: 'CODE AGRIUS',
      spark: [1, 2, 3, 4, 6, 7, 8, 9]
    },
    {
      label: 'ERP Modules',
      value: '6',
      suffix: '',
      description: 'CRM · HR · Inventory · Sales · Reporting · Admin',
      eyebrow: 'NX MONOREPO',
      spark: [2, 4, 3, 6, 5, 7, 6, 8]
    }
  ],
  socials: [
    { platform: 'GitHub', url: 'https://github.com/iamhamzabaig' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/iamhamzabaig-in' }
  ]
};

// Display thesis for the hero. `accent` is rendered in the accent color inline.
export const heroThesis = {
  lead: 'I help teams ship',
  accent: 'fast, scalable',
  tail: 'enterprise software.'
};

export const fallbackExperience = [
  {
    company: 'Code Agrius · Agrius IT',
    role: 'Full-Stack Developer (Angular · React · Node)',
    period: 'Jan 2025 — Present',
    location: 'Islamabad, PK',
    points: [
      'Architected feature-based libraries for 6 core ERP modules (CRM, HR, Inventory, Sales, Reporting, Admin) inside an Nx monorepo.',
      'Designed real-time executive and sales dashboards in Angular + ECharts tracking lead conversion and pipeline health.',
      'Built an enterprise attendance and automated timesheet platform for 120+ employees.',
      'Established secure REST and WebSocket integrations with JWT auth and strict RBAC.'
    ]
  },
  {
    company: 'Aims Soft',
    role: 'Junior Frontend Engineer (Angular)',
    period: 'Jul 2022 — Jan 2025',
    location: 'Islamabad, PK',
    points: [
      'Led frontend for a Guest House Management System: reservation flows, calendar integration, occupancy-based dynamic pricing.',
      'Streamlined invoice generation, cutting manual billing errors by 95%.',
      'Built a shared library of 12+ reusable UI components with strict TypeScript interfaces, cutting duplication by 35%.',
      'Migrated 4 core finance and reporting modules from Angular 13 to Angular 17.'
    ]
  },
  {
    company: 'Eziline Software House',
    role: 'Frontend Developer (React)',
    period: 'Oct 2022 — Dec 2022',
    location: 'Pakistan',
    points: [
      'Shipped cross-platform UIs, custom design systems, and responsive layouts in React and modern CSS frameworks.'
    ]
  }
];

export const fallbackSkills = [
  { group: 'Frontend', items: ['Angular 17–20', 'React 18 + Next.js', 'TypeScript (strict)', 'Vue + Nuxt 2'] },
  { group: 'State & Reactive', items: ['RxJS', 'NgRx', 'Redux Toolkit', 'Zustand'] },
  { group: 'UI & Styling', items: ['Tailwind CSS', 'SCSS', 'Angular Material', 'Framer Motion'] },
  { group: 'Data Viz', items: ['ECharts', 'Highcharts', 'Chart.js'] },
  { group: 'Backend & Real-Time', items: ['Node.js', 'Express', 'Socket.io', 'GraphQL (Apollo)'] },
  { group: 'Data & Tooling', items: ['MongoDB', 'MySQL', 'Nx Monorepo', 'Vite', 'Docker'] }
];

export const fallbackEducation = [
  { title: 'B.S. Computer Science', org: 'Virtual University of Pakistan', period: '2019 — 2023' },
  { title: 'JavaScript (Intermediate)', org: 'HackerRank', period: 'Certificate' },
  { title: 'Responsive Web Design', org: 'freeCodeCamp', period: 'Certificate' }
];

export const fallbackProjects = [
  {
    _id: 'oreius-voting',
    title: 'Oreius Voting App',
    slug: 'oreius-voting-app',
    description:
      'Real-time, event-driven internal voting platform with optimistic UI updates, live vote aggregation, and dynamic charting panels.',
    content:
      'Built for live events: votes stream over Socket.io and aggregate in real time, with optimistic updates that keep the UI snappy under load and charting panels that animate as results land.',
    tags: ['React', 'Express', 'MongoDB', 'Socket.io'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: 'https://github.com/iamhamzabaig',
    featured: true
  },
  {
    _id: 'bitcyllionaire',
    title: 'Bitcyllionaire',
    slug: 'bitcyllionaire',
    description:
      'Cryptocurrency portfolio tracker with real-time price sync over GraphQL subscriptions and full Stripe subscription billing.',
    content:
      'A portfolio tracker wired to GraphQL subscriptions for live price sync, Zustand for client state, and an end-to-end Stripe subscription billing flow.',
    tags: ['React', 'GraphQL', 'Apollo', 'Zustand', 'Stripe'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: 'https://github.com/iamhamzabaig',
    featured: true
  },
  {
    _id: 'theabfoods',
    title: 'TheABFoods',
    slug: 'theabfoods',
    description:
      'High-performance marketing web app for a global rice exporter, with fast HMR bundling and liquid-smooth page transitions.',
    content:
      'A marketing site tuned for speed: Vite for instant HMR, Tailwind for a tight design system, and Framer Motion for page transitions that stay smooth on low-end devices.',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: 'https://github.com/iamhamzabaig',
    featured: true
  },
  {
    _id: 'bitcy-club',
    title: 'Bitcy Club',
    slug: 'bitcy-club',
    description:
      'Community portal optimized with SSR for fast initial loads, plus secure user authentication.',
    content:
      'A community portal built on Nuxt 2 with server-side rendering for fast first paint, Firebase auth, and a GraphQL data layer.',
    tags: ['Vue.js', 'Nuxt 2', 'Firebase', 'GraphQL'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: 'https://github.com/iamhamzabaig',
    featured: false
  },
  {
    _id: 'enterprise-erp',
    title: 'Enterprise ERP Suite',
    slug: 'enterprise-erp-suite',
    description:
      'Six feature-based ERP modules in an Nx monorepo — CRM, HR, Inventory, Sales, Reporting, Admin — with real-time dashboards and RBAC.',
    content:
      'A monorepo of enterprise modules sharing a component library and design system, with ECharts executive dashboards, WebSocket live data, and role-based access control across the suite.',
    tags: ['Angular 20', 'Nx', 'ECharts', 'RxJS', 'RBAC'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: '',
    featured: false
  }
];

export const getProjectBySlug = (slug) => fallbackProjects.find((project) => project.slug === slug);
