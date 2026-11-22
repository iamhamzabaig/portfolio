import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { SectionTitle } from '../../components/ide/CodeBlock.jsx';
import { ContactForm } from '../../features/contact/components/ContactForm.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

export default function Contact() {
  const { email, phone, location, socials } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url;
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url;
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked: the mailto link still works. */
    }
  };

  return (
    <Container className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionTitle as="h1" file="contact.sh">Let&apos;s build something.</SectionTitle>
          <p className="mt-6 text-body text-muted">
            Tell me what you&apos;re building, what exists today, and your timeline. I reply within a day.
          </p>

          <div className="mt-10 grid gap-3 text-body-sm">
            <div className="flex items-center gap-2">
              <a href={`mailto:${email}`} className="link-draw inline-flex items-center gap-3 text-muted hover:text-ink">
                <Mail aria-hidden="true" size={18} strokeWidth={1.5} className="text-accent" /> {email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={copied ? 'Email copied' : 'Copy email'}
                className="spring-press inline-grid h-8 w-8 place-items-center rounded-control text-muted hover:bg-surface hover:text-ink"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={copied ? 'done' : 'copy'}
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  >
                    {copied ? <Check aria-hidden="true" size={15} className="text-accent" /> : <Copy aria-hidden="true" size={15} />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span role="status" className="sr-only">{copied ? 'Email copied to clipboard' : ''}</span>
            </div>
            <a href={`tel:${phone.replace(/\s|-/g, '')}`} className="link-draw inline-flex items-center gap-3 self-start text-muted hover:text-ink">
              <Phone aria-hidden="true" size={18} strokeWidth={1.5} className="text-accent" /> {phone}
            </a>
            <p className="inline-flex items-center gap-3 text-muted">
              <MapPin aria-hidden="true" size={18} strokeWidth={1.5} className="text-accent" /> {location}
            </p>
          </div>

          <div className="mt-8 -ml-2.5 flex items-center gap-1">
            <a
              href={github}
              aria-label="GitHub"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <Github aria-hidden="true" size={20} strokeWidth={1.5} />
            </a>
            <a
              href={linkedin}
              aria-label="LinkedIn"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <Linkedin aria-hidden="true" size={20} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-card bg-panel font-mono shadow-overlay ring-1 ring-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-caption text-muted">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f7768e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e0af68]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#9ece6a]" />
            </span>
            <span className="ml-2">bash — contact.sh</span>
          </div>
          <div className="term-form p-6 sm:p-8">
            <p className="mb-6 text-caption text-muted">
              <span className="syn-keyword">$</span> ./contact.sh --interactive
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
