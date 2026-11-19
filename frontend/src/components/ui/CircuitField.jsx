import { useEffect, useRef } from 'react';

// Animated circuit board backdrop: traces routed on a grid with 45° bends,
// solder pads at their ends, and data pulses travelling along them. Pads near
// the pointer light up. Drawn on canvas, coloured from the theme tokens, paused
// offscreen, and static under reduced motion.

const CELL = 28;

// Small seeded RNG so the board layout is the same on every visit.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildTraces(cols, rows, density, seed) {
  const rand = rng(seed);
  const used = new Set();
  const key = (x, y) => `${x},${y}`;
  const traces = [];
  const count = Math.round(cols * rows * density);
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  for (let t = 0; t < count; t++) {
    let x = Math.floor(rand() * cols);
    let y = Math.floor(rand() * rows);
    if (used.has(key(x, y))) continue;
    let [dx, dy] = dirs[Math.floor(rand() * 4)];
    const pts = [[x, y]];
    used.add(key(x, y));
    const len = 4 + Math.floor(rand() * 10);
    for (let i = 0; i < len; i++) {
      // Occasionally turn 45° then straighten, the way board traces are routed.
      if (rand() < 0.22) {
        const diag = rand() < 0.5 ? 1 : -1;
        const ndx = dx === 0 ? diag : dx;
        const ndy = dy === 0 ? diag : dy;
        dx = ndx; dy = ndy;
      } else if (dx !== 0 && dy !== 0 && rand() < 0.6) {
        if (rand() < 0.5) dx = 0; else dy = 0;
      }
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || used.has(key(nx, ny))) break;
      x = nx; y = ny;
      used.add(key(x, y));
      pts.push([x, y]);
    }
    if (pts.length > 2) traces.push({ pts, offset: rand(), speed: 0.05 + rand() * 0.08 });
  }
  return traces;
}

function readColor(el, name, fallback) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v ? v.split(/\s+/).join(',') : fallback;
}

export function CircuitField({ className = '', density = 0.09, seed = 7, fade = 'radial' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') return undefined;
    if (/jsdom/i.test(navigator.userAgent)) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let traces = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      traces = buildTraces(Math.ceil(w / CELL) + 1, Math.ceil(h / CELL) + 1, density, seed);
    };

    const draw = (time) => {
      const ink = readColor(canvas, '--ink', '13,13,15');
      const accent = readColor(canvas, '--accent', '198,58,6');
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (const tr of traces) {
        const p = tr.pts;
        ctx.strokeStyle = `rgba(${ink},0.17)`;
        ctx.beginPath();
        ctx.moveTo(p[0][0] * CELL, p[0][1] * CELL);
        for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0] * CELL, p[i][1] * CELL);
        ctx.stroke();

        // Pads at both ends, lit by pointer proximity.
        for (const [px, py] of [p[0], p[p.length - 1]]) {
          const x = px * CELL;
          const y = py * CELL;
          const near = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / 180);
          ctx.fillStyle = near > 0.02 ? `rgba(${accent},${0.25 + near * 0.75})` : `rgba(${ink},0.3)`;
          ctx.beginPath();
          ctx.arc(x, y, 2.4 + near * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // A pulse travels each trace.
        if (!reduce) {
          const segs = p.length - 1;
          const t = ((time / 1000) * tr.speed + tr.offset) % 1;
          const pos = t * segs;
          const i = Math.floor(pos);
          const f = pos - i;
          const x = (p[i][0] + (p[i + 1][0] - p[i][0]) * f) * CELL;
          const y = (p[i][1] + (p[i + 1][1] - p[i][1]) * f) * CELL;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
          g.addColorStop(0, `rgba(${accent},0.9)`);
          g.addColorStop(1, `rgba(${accent},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (time) => {
      frame = 0;
      if (!visible) return;
      draw(time);
      if (!reduce) frame = requestAnimationFrame(loop);
    };

    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      if (reduce) draw(0);
    };

    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(0); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const theme = new MutationObserver(() => draw(performance.now()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      theme.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, [density, seed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`circuit-field circuit-fade-${fade} ${className}`} />;
}
