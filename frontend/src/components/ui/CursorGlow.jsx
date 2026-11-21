import { useEffect, useRef } from 'react';

// A soft ember light that trails the pointer and lights up the dot grid under
// it. Vars live on this one fixed layer (not .world) so moving it never
// restyles the page. Fine pointers only; static under reduced motion.
export function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!el || !fine.matches || reduce.matches) return undefined;
    const target = { x: -999, y: -999 };
    const pos = { x: -999, y: -999 };
    let frame = 0;
    const tick = () => {
      // Lerp gives the light a little weight behind the cursor.
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      el.style.setProperty('--cx', `${pos.x.toFixed(1)}px`);
      el.style.setProperty('--cy', `${pos.y.toFixed(1)}px`);
      frame = Math.hypot(target.x - pos.x, target.y - pos.y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      if (pos.x === -999) { pos.x = e.clientX; pos.y = e.clientY; }
      target.x = e.clientX;
      target.y = e.clientY;
      el.dataset.on = '';
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => delete el.dataset.on;
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-glow" />;
}
