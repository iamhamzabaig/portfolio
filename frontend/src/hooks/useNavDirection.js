import { useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { navLinks } from '../components/layout/navLinks.js';

// Decide which way a page slides. Returns 1 (forward — new page enters from the
// right) or -1 (back — enters from the left).
//
// Preference order:
//  1. If both the previous and current routes are primary tabs, compare their
//     index in `navLinks` — moving right along the bar slides forward.
//  2. Otherwise fall back to the browser history action: POP (back/forward
//     button, swipe-back) is treated as a backward slide; PUSH/REPLACE forward.
// This gives a natural push/pop feel for tab taps and for drilling into
// /projects/:slug and back.
function tabIndex(pathname) {
  return navLinks.findIndex((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)));
}

export function useNavDirection() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'
  const prevPath = useRef(pathname);

  let direction = navType === 'POP' ? -1 : 1;

  const from = tabIndex(prevPath.current);
  const to = tabIndex(pathname);
  if (from !== -1 && to !== -1 && from !== to) {
    direction = to > from ? 1 : -1;
  }

  // Record for the next navigation. Safe to mutate during render for this
  // last-value ref pattern.
  if (prevPath.current !== pathname) {
    prevPath.current = pathname;
  }

  return direction;
}
