// Primary CTAs lean toward the pointer; CSS (`translate` + spring linear()) does
// the motion and the spring-back. One delegated listener per page.
const SELECTOR = '.btn-primary, .btn-accent, [data-magnetic]';
const PULL = 0.25;
const MAX = 10;

export function enableMagnetic(root) {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = null;
  const release = () => {
    current?.style.removeProperty('--mag-x');
    current?.style.removeProperty('--mag-y');
    current = null;
  };
  const move = (e) => {
    if (!fine.matches || reduce.matches) return;
    const el = e.target.closest?.(SELECTOR);
    if (el !== current) release();
    if (!el) return;
    current = el;
    const r = el.getBoundingClientRect();
    const clamp = (v) => Math.max(-MAX, Math.min(MAX, v * PULL));
    el.style.setProperty('--mag-x', `${clamp(e.clientX - r.left - r.width / 2)}px`);
    el.style.setProperty('--mag-y', `${clamp(e.clientY - r.top - r.height / 2)}px`);
  };
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', release);
  return () => {
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', release);
    release();
  };
}
