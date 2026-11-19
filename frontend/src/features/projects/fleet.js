import { fallbackProjects } from '../../utils/fallbackData.js';

// Presentation meta for project case studies (status, route, commit count, tint).
// Keyed by slug so projects from Supabase pick it up too; unknown slugs get a
// plain steel panel. Numbers are real counts from each repo, not estimates.
export const fleetMeta = {
  'drop-in': {
    status: 'Live',
    route: 'drop-in.co.uk',
    plate: '128',
    plateNote: 'commits',
    paint: 'blue',
    slogan: 'Prescriptions, not promises.',
    built: '2026'
  },
  'agrius-pulse': {
    status: 'Live',
    route: 'agriuspulse.com',
    plate: '733',
    plateNote: 'commits',
    paint: 'red',
    slogan: 'Wakes up so you don’t have to.',
    built: '2026'
  },
  'asaan-dukaan': {
    status: 'Shipping v0.1',
    route: 'Windows desktop, offline',
    plate: '399',
    plateNote: 'commits',
    paint: 'green',
    slogan: 'Internet or not, the shop keeps running.',
    built: '2026'
  },
  'ai-knowledge-assistant': {
    status: 'Demo',
    route: 'Runs in your browser',
    paint: 'yellow',
    slogan: 'Cites its sources or keeps quiet.',
    built: '2025'
  },
  medipoint: {
    status: 'In progress',
    route: 'Desktop, offline-first',
    paint: 'steel',
    slogan: 'Architecture first, UI next.',
    built: '2026'
  }
};

const fallback = { status: 'Shipped', paint: 'steel' };

export function getFleetMeta(project) {
  return { ...fallback, ...(fleetMeta[project?.slug] || {}) };
}

// Showcase projects live in code until they are added from the admin: list them
// first, then the database ones, skipping any slug the database already has.
export function withShowcase(projects) {
  if (!projects?.length) return fallbackProjects;
  const have = new Set(projects.map((p) => p.slug));
  return [...fallbackProjects.filter((p) => fleetMeta[p.slug] && !have.has(p.slug)), ...projects];
}
