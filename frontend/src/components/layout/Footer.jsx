import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export function Footer() {
  const { socials, email } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/iamhamzabaig';
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com/in/iamhamzabaig-in';

  return (
    <footer className="bg-surface">
      <Container className="py-12">
        <div className="flex flex-col gap-8 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-body-sm font-semibold tracking-tight text-ink">Hamza Munawar</p>
            <p className="mt-2 text-caption text-muted">
              Full-Stack JavaScript Engineer building scalable ERP modules, real-time apps, and
              high-performance frontends.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-caption text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="-ml-2.5 flex items-center gap-1">
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

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[12px] text-muted sm:flex-row">
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
          <p>Islamabad, Pakistan · Open to full-stack &amp; frontend roles</p>
        </div>
      </Container>
    </footer>
  );
}
