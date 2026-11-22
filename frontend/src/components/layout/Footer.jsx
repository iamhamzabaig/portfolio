import { useEffect, useState } from 'react';
import { GitBranch, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TelemetryStrip } from '../ui/TelemetryStrip.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

function useIslamabadTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// IDE status bar: branch, live telemetry, availability, local time, socials.
// Fixed to the bottom from md; on phones it sits at the end of the page.
export function Footer() {
  const { socials, email } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/iamhamzabaig';
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com/in/iamhamzabaig-in';
  const time = useIslamabadTime();
  const icon = 'inline-flex h-7 w-7 items-center justify-center hover:text-ink';

  return (
    <footer className="z-40 flex whitespace-nowrap min-h-7 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-panel px-3 py-1 font-mono text-micro text-muted md:fixed md:inset-x-0 md:bottom-0 md:h-7 md:flex-nowrap md:py-0">
      <span className="inline-flex items-center gap-1.5 text-accent">
        <GitBranch aria-hidden="true" size={12} />
        main
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="dot dot-live" />
        open to work
      </span>
      <div className="hidden max-h-7 min-w-0 overflow-hidden xl:block">
        <TelemetryStrip />
      </div>
      <span className="ml-auto">Islamabad {time} PKT</span>
      <span className="hidden sm:inline">UTF-8</span>
      <span className="flex items-center">
        <a href={`mailto:${email}`} aria-label="Email" className={icon}><Mail aria-hidden="true" size={13} /></a>
        <a href={github} aria-label="GitHub" className={icon}><Github aria-hidden="true" size={13} /></a>
        <a href={linkedin} aria-label="LinkedIn" className={icon}><Linkedin aria-hidden="true" size={13} /></a>
      </span>
      <Link to="/admin/login" className="text-muted/50 hover:text-muted">Admin</Link>
    </footer>
  );
}
