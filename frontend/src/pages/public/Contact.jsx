import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ContactForm } from '../../features/contact/components/ContactForm.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

export default function Contact() {
  const { email, phone, location, socials } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url;
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url;

  return (
    <Container className="py-16">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="font-mono text-xs tracking-eyebrow text-accent">CONTACT</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Let&apos;s build something.
          </h1>
          <p className="mt-6 leading-7 text-muted">
            Tell me what you&apos;re building, what exists today, and your timeline. I reply within a day.
          </p>

          <div className="mt-8 grid gap-2 text-sm">
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-muted transition hover:text-ink">
              <Mail aria-hidden="true" size={17} className="text-accent" /> {email}
            </a>
            <a href={`tel:${phone.replace(/\s|-/g, '')}`} className="flex items-center gap-3 text-muted transition hover:text-ink">
              <Phone aria-hidden="true" size={17} className="text-accent" /> {phone}
            </a>
            <p className="flex items-center gap-3 text-muted">
              <MapPin aria-hidden="true" size={17} className="text-accent" /> {location}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <a
              href={github}
              aria-label="GitHub"
              className="rounded-full border border-border p-2 text-muted transition hover:border-accent hover:text-ink"
            >
              <Github aria-hidden="true" size={18} />
            </a>
            <a
              href={linkedin}
              aria-label="LinkedIn"
              className="rounded-full border border-border p-2 text-muted transition hover:border-accent hover:text-ink"
            >
              <Linkedin aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        <Card className="p-6">
          <ContactForm />
        </Card>
      </div>
    </Container>
  );
}
