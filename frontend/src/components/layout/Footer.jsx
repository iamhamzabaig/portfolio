import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container.jsx';
import { navLinks } from './navLinks.js';
import { TelemetryStrip } from '../ui/TelemetryStrip.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

const expertise = [
  'RAG & LLM apps',
  'AI agents',
  'Angular 17–20',
  'React + Next.js',
  'Node & Express'
];

export function Footer() {
  const { socials, email, phone, location } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/iamhamzabaig';
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com/in/iamhamzabaig-in';
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`;

  return (
    <footer className="bg-surface">
      <Container className="py-14">
        <div className="grid grid-cols-1 gap-10 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <p className="font-display text-body-sm font-semibold tracking-tight text-ink">Hamza Munawar</p>
            <p className="mt-3 text-caption text-muted">
              Full-Stack &amp; AI Engineer building scalable ERP modules, real-time apps, and
              production AI features — RAG, agents, and LLM apps.
            </p>
            <div className="-ml-2.5 mt-4 flex items-center gap-1">
              <a href={`mailto:${email}`} aria-label="Email" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink">
                <Mail aria-hidden="true" size={18} strokeWidth={1.5} />
              </a>
              <a href={github} aria-label="GitHub" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink">
                <Github aria-hidden="true" size={18} strokeWidth={1.5} />
              </a>
              <a href={linkedin} aria-label="LinkedIn" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink">
                <Linkedin aria-hidden="true" size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted/70">Explore</p>
            <nav aria-label="Footer" className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-caption text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted/70">Expertise</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {expertise.map((item) => (
                <li key={item} className="text-caption text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted/70">Get in touch</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href={`mailto:${email}`} className="group flex items-center gap-2.5 text-caption text-muted transition-colors hover:text-ink">
                  <Mail aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0 text-muted/70 transition-colors group-hover:text-ink" />
                  {email}
                </a>
              </li>
              <li>
                <a href={telHref} className="group flex items-center gap-2.5 text-caption text-muted transition-colors hover:text-ink">
                  <Phone aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0 text-muted/70 transition-colors group-hover:text-ink" />
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-caption text-muted">
                <MapPin aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0 text-muted/70" />
                {location}
              </li>
            </ul>
            <p className="mt-4 inline-flex items-center gap-2 text-caption text-muted">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open to full-stack &amp; frontend roles
            </p>
          </div>
        </div>

        {/* Instrumentation strip — live, measured signals in mono. */}
        <div className="mt-6 border-t border-border/60 pt-5">
          <TelemetryStrip />
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-caption text-muted sm:flex-row">
          <p>
            Copyright © {new Date().getFullYear()} Hamza Munawar. Built with React &amp; Supabase.{' '}
            <Link to="/styleguide" className="transition hover:text-ink">
              Design system
            </Link>
            {' · '}
            <Link to="/admin/login" className="text-muted/40 transition hover:text-muted">
              Admin
            </Link>
          </p>
          <p>Designed &amp; built in {location}</p>
        </div>
      </Container>
    </footer>
  );
}
