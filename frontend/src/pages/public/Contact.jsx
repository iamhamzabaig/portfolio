import { Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { RevealScope } from '../../components/ui/RevealScope.jsx';
import { ContactForm } from '../../features/contact/components/ContactForm.jsx';
import { fallbackProfile } from '../../utils/fallbackData.js';

export default function Contact() {
  const { email, phone, location, socials } = fallbackProfile;
  const github = socials.find((s) => s.platform === 'GitHub')?.url;
  const linkedin = socials.find((s) => s.platform === 'LinkedIn')?.url;

  return (
    <Container className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <RevealScope immediate>
          <p data-fade className="text-[15px] font-semibold text-accent">Contact</p>
          <h1 data-split className="mt-3 font-display text-fluid-h1 font-semibold text-ink">
            Let&apos;s build
            <br /> something.
          </h1>
          <p data-split className="mt-6 text-lg leading-8 text-muted">
            Tell me what you&apos;re building, what exists today, and your timeline. I reply within a day.
          </p>

          <div data-fade className="mt-10 grid gap-3 text-[15px]">
            <a href={`mailto:${email}`} className="inline-flex items-center gap-3 text-muted transition hover:text-ink">
              <Mail aria-hidden="true" size={18} className="text-accent" /> {email}
            </a>
            <a href={`tel:${phone.replace(/\s|-/g, '')}`} className="inline-flex items-center gap-3 text-muted transition hover:text-ink">
              <Phone aria-hidden="true" size={18} className="text-accent" /> {phone}
            </a>
            <p className="inline-flex items-center gap-3 text-muted">
              <MapPin aria-hidden="true" size={18} className="text-accent" /> {location}
            </p>
          </div>

          <div data-fade className="mt-8 flex items-center gap-2">
            <a
              href={github}
              aria-label="GitHub"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted transition hover:text-ink"
            >
              <Github aria-hidden="true" size={18} />
            </a>
            <a
              href={linkedin}
              aria-label="LinkedIn"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-muted transition hover:text-ink"
            >
              <Linkedin aria-hidden="true" size={18} />
            </a>
          </div>
        </RevealScope>

        <Card className="p-8">
          <ContactForm />
        </Card>
      </div>
    </Container>
  );
}
