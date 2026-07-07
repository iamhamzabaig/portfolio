// Static portfolio content for Hamza Munawar. Used as the render source whenever
// the API has no data yet (fresh deploy) or is unreachable, so the public site is
// never empty. The admin/API can override profile + projects at runtime.

export const fallbackProfile = {
  name: 'Hamza Munawar',
  role: 'Full-Stack & AI Engineer',
  headline:
    'I build scalable ERP modules, real-time apps, and high-performance frontends in Angular, React, and Node — and ship AI into production: RAG pipelines, LLM-powered features, and tool-calling agents.',
  bio: 'Performance-driven full-stack engineer with 3+ years shipping enterprise ERP modules, real-time platforms, and fast frontend architectures. I work across Angular (v13–v20), React/Next.js, and Node/Express inside Nx monorepos — turning legacy monoliths into measurable wins on speed, bundle size, and developer workflow. On the AI side I build production LLM features end to end: retrieval-augmented generation over private data with embeddings and vector search, tool-calling agents that automate real workflows, and assistants wired into OpenAI and Claude APIs — with grounded, cited answers rather than demos.',
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
  { group: 'AI Engineering', items: ['OpenAI & Claude APIs', 'RAG + embeddings', 'Vector DBs (pgvector, Pinecone)', 'LangChain / LlamaIndex', 'Tool-calling agents', 'Prompt engineering'] },
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
    _id: 'ai-knowledge-assistant',
    title: 'AI Knowledge Assistant',
    slug: 'ai-knowledge-assistant',
    description:
      'Retrieval-augmented assistant that answers over private documents — embeddings and vector search feed an LLM for grounded, cited responses.',
    content:
      'A production RAG pipeline: documents are chunked and embedded into a vector store, semantically retrieved at query time, and passed to an LLM (OpenAI / Claude) with source citations. A tool-calling agent layer handles actions beyond plain Q&A, and answers stream token-by-token into a React UI.',
    tags: ['RAG', 'OpenAI', 'Claude', 'pgvector', 'LangChain', 'React'],
    coverImage: { url: '' },
    liveUrl: '',
    repoUrl: 'https://github.com/iamhamzabaig',
    featured: true
  },
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

// ── "How I engineer" section ──────────────────────────────────────────────
// Drives the animated architecture diagram + principles on the home page. The
// pipeline is the real shape of the RAG system in fallbackProjects[0]; keep the
// two in sync. `kind` tags a node so the diagram can accent the store/model.
export const engineeringApproach = {
  pipeline: [
    { id: 'ingest', label: 'Ingest', sub: 'chunk + clean', kind: 'io' },
    { id: 'embed', label: 'Embed', sub: 'OpenAI vectors', kind: 'compute' },
    { id: 'store', label: 'pgvector', sub: 'HNSW index', kind: 'store' },
    { id: 'retrieve', label: 'Retrieve', sub: 'top-k + rerank', kind: 'compute' },
    { id: 'llm', label: 'LLM', sub: 'cite-or-refuse', kind: 'model' },
    { id: 'ui', label: 'React UI', sub: 'streamed tokens', kind: 'io' }
  ],
  principles: [
    {
      title: 'Measure before optimizing',
      text: 'Profile first, then cut. Every performance claim on this site traces to a before/after number, not a vibe.'
    },
    {
      title: 'Typed contracts, end to end',
      text: 'Strict TypeScript and validated schemas from the API boundary to the component props — the compiler catches the class of bug I never have to debug.'
    },
    {
      title: 'Grounded AI, not demos',
      text: 'Retrieval with citations and a cite-or-refuse prompt. The model answers from your data or admits it does not know.'
    },
    {
      title: 'Ship to production',
      text: 'CI, containerized deploys, and observability from the first commit. Done means running in production, not running on my machine.'
    }
  ]
};

// ── Client-side retrieval demo corpus ─────────────────────────────────────
// Powers the in-browser semantic-search demo on the AI Knowledge Assistant
// project page. Ranking is real TF cosine (see SemanticSearchDemo) over these
// snippets — a stand-in for a private knowledge base, no backend or LLM call.
export const aiAssistantCorpus = [
  {
    id: 'onboarding',
    title: 'Onboarding a new workspace',
    text: 'To set up a new workspace, invite teammates by email, then upload the documents you want the assistant to answer over. Ingestion chunks and embeds each file automatically; large PDFs may take a few minutes to index.'
  },
  {
    id: 'billing',
    title: 'Billing & subscription plans',
    text: 'Plans are billed monthly per seat. You can upgrade, downgrade, or cancel anytime from the billing settings. Usage above the plan quota is charged at the metered embedding and generation rate.'
  },
  {
    id: 'security',
    title: 'Data security & privacy',
    text: 'Documents are encrypted at rest and in transit. Embeddings live in an isolated per-tenant vector store, and your data is never used to train third-party models. Access is scoped by role-based permissions.'
  },
  {
    id: 'citations',
    title: 'How answers are grounded',
    text: 'Every answer is retrieved from your own documents and returned with source citations. The system prompt forces the model to cite a passage or say it does not know, which is how hallucinations are kept out.'
  },
  {
    id: 'rate-limits',
    title: 'API rate limits',
    text: 'The REST API allows a fixed number of requests per minute per key. Exceeding the limit returns HTTP 429 with a Retry-After header. Batch embedding endpoints have a separate, higher quota for bulk ingestion.'
  },
  {
    id: 'vector-search',
    title: 'How semantic search works',
    text: 'Queries are embedded into the same vector space as your documents, then matched by approximate nearest-neighbor search over an HNSW index. Top results are re-ranked for relevance before being passed to the language model.'
  },
  {
    id: 'deployment',
    title: 'Self-hosted deployment',
    text: 'The assistant ships as containers and runs on your own infrastructure with Docker. Postgres with the pgvector extension stores embeddings, so there is no separate vector database to operate or keep in sync.'
  },
  {
    id: 'agents',
    title: 'Tool-calling agents',
    text: 'Beyond plain question answering, an agent layer can call tools to look up records, trigger workflows, and take actions. Tool calls are validated against a schema so the model cannot invoke them with malformed arguments.'
  }
];

export const getProjectBySlug = (slug) => fallbackProjects.find((project) => project.slug === slug);
