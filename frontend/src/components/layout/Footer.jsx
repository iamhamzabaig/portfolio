import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

const credentials = ['ISLAMABAD, PK', 'FULL-STACK JS', 'ANGULAR · REACT · NODE', '3+ YEARS', 'OPEN TO WORK'];

export function Footer() {
  const { socials, email } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url || 'https://github.com/iamhamzabaig';
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com/in/iamhamzabaig-in';

  return (
    <footer className="border-t border-border">
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-eyebrow text-muted">
          {credentials.map((item, i) => (
            <span key={item} className="inline-flex items-center gap-3">
              {i > 0 && <span className="text-accent/60">·</span>}
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-border pt-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Hamza Munawar. Built with React, Express &amp; MongoDB.</p>
          <div className="flex items-center gap-1">
            <a href={`mailto:${email}`} aria-label="Email" className="rounded-full p-2 transition hover:bg-surface hover:text-ink">
              <Mail aria-hidden="true" size={18} />
            </a>
            <a href={github} aria-label="GitHub" className="rounded-full p-2 transition hover:bg-surface hover:text-ink">
              <Github aria-hidden="true" size={18} />
            </a>
            <a href={linkedin} aria-label="LinkedIn" className="rounded-full p-2 transition hover:bg-surface hover:text-ink">
              <Linkedin aria-hidden="true" size={18} />
            </a>
            <Link to="/contact" className="ml-2 rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-accent hover:text-ink">
              Get in touch
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
