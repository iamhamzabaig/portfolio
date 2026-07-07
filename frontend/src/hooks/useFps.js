import { useEffect, useRef, useState } from 'react';

// Live frames-per-second meter. Measures real frame deltas via rAF and reports
// roughly once a second. Pauses on hidden tab (and never starts under reduced
// motion or when `active` is false) so it costs nothing when out of view.
export function useFps({ active = true } = {}) {
  const [fps, setFps] = useState(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active || typeof requestAnimationFrame !== 'function') return undefined;

    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Honor motion preferences: report the display's nominal rate, no loop.
      setFps(60);
      return undefined;
    }

    let frames = 0;
    let last = performance.now();
    let running = true;

    const loop = (now) => {
      frames += 1;
      const elapsed = now - last;
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed));
        frames = 0;
        last = now;
      }
      if (running && !document.hidden) rafRef.current = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (!document.hidden && running) {
        last = performance.now();
        frames = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);

  return fps;
}
