import { useEffect, useState } from 'react';

// Subscribe to a CSS media query and re-render on match changes. SSR/jsdom-safe:
// when matchMedia is unavailable (tests) it reports `false`, so consumers fall
// back to their non-matching branch (e.g. desktop transitions) without crashing.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
