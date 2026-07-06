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
            <p className="font-display text-[15px] font-semibold tracking-tight text-ink">Hamza Munawar</p>
            <p className="mt-2 text-[13px] leading-6 text-muted">
              Full-Stack JavaScript Engineer building scalable ERP modules, real-time apps, and
              high-performance frontends.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a href={`mailto:${email}`} aria-label="Email" className="p-2 text-muted transition-colors hover:text-ink">
              <Mail aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
            <a href={github} aria-label="GitHub" className="p-2 text-muted transition-colors hover:text-ink">
              <Github aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
            <a href={linkedin} aria-label="LinkedIn" className="p-2 text-muted transition-colors hover:text-ink">
              <Linkedin aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[12px] text-muted sm:flex-row">
          <p>
            Copyright © {new Date().getFullYear()} Hamza Munawar. Built with React &amp; Supabase.{' '}
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
