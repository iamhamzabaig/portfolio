// Build-time constants injected by Vite's `define` (see vite.config.js). The
// `typeof` guards keep this safe under Vitest, where the defines are absent.
export const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev';
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';

// First Contentful Paint from the Paint Timing API — a real render number for
// the telemetry strip. Returns null where the API is unavailable (e.g. jsdom).
export function firstContentfulPaint() {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') return null;
  const entry = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint');
  return entry ? Math.round(entry.startTime) : null;
}
