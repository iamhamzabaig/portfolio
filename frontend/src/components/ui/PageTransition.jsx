import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createScrollMotion } from '../../lib/scrollMotion.js';

// Scene controllers own motion; keep the route wrapper untransformed for pins.
export function PageTransition({ children }) {
  const root = useRef(null);
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    else document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    return createScrollMotion(root.current);
  }, [pathname, hash]);
  return <div ref={root}>{children}</div>;
}
