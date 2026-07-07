import { useEffect, useRef, useState } from 'react';
import { useFps } from '../../hooks/useFps.js';
import { BUILD_TIME, COMMIT_HASH, firstContentfulPaint } from '../../lib/buildInfo.js';

// A quiet "instrumentation" strip for the footer — real, measured signals
// rendered in mono: live FPS (only while the strip is on screen), first paint,
// the deployed commit, and the stack. Decorative separators are aria-hidden.

const stack = ['React 18', 'Vite', 'Tailwind', 'Supabase'];

function Dot() {
  return <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-success" />;
}

function Sep() {
  return <span aria-hidden="true" className="text-border">·</span>;
}

export function TelemetryStrip() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [fcp, setFcp] = useState(null);
  const fps = useFps({ active: inView });

  useEffect(() => {
    setFcp(firstContentfulPaint());
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !ref.current) {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const buildDate = BUILD_TIME ? BUILD_TIME.slice(0, 10) : null;

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-muted"
    >
      <span className="inline-flex items-center gap-1.5" title="Live render rate">
        <Dot />
        {fps != null ? `${fps} fps` : '— fps'}
      </span>
      {fcp != null && (
        <>
          <Sep />
          <span title="First Contentful Paint">{fcp}ms paint</span>
        </>
      )}
      <Sep />
      <span title="Deployed commit">
        <span className="text-muted/60">commit</span> {COMMIT_HASH}
      </span>
      {buildDate && (
        <>
          <Sep />
          <span title="Build date">{buildDate}</span>
        </>
      )}
      <Sep />
      <span className="inline-flex flex-wrap items-center gap-x-1.5">
        {stack.map((tech, i) => (
          <span key={tech} className="inline-flex items-center gap-1.5">
            {i > 0 && <Sep />}
            {tech}
          </span>
        ))}
      </span>
    </div>
  );
}
