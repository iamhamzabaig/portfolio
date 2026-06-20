import { Container } from '../../components/layout/Container.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import {
  fallbackProfile,
  fallbackExperience,
  fallbackSkills,
  fallbackEducation
} from '../../utils/fallbackData.js';

function SectionLabel({ index, label }) {
  return (
    <div className="mb-8 flex items-center gap-5">
      <span className="font-mono text-xs tracking-eyebrow text-accent">{index} · {label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function About() {
  const profileQuery = useProfile();
  const profile = profileQuery.data || fallbackProfile;

  return (
    <Container className="py-16">
      {/* Intro */}
      <div className="max-w-3xl">
        <p className="font-mono text-xs tracking-eyebrow text-accent">ABOUT</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {profile.name}
        </h1>
        <p className="mt-2 font-mono text-sm text-muted">{fallbackProfile.role} · {fallbackProfile.location}</p>
        <p className="mt-6 text-lg leading-8 text-muted">{profile.bio || fallbackProfile.bio}</p>
      </div>

      {/* Experience */}
      <section className="mt-20">
        <SectionLabel index="01" label="EXPERIENCE" />
        <div className="space-y-px">
          {fallbackExperience.map((job) => (
            <article
              key={job.company}
              className="grid gap-4 border-t border-border py-8 md:grid-cols-[0.9fr_1.6fr]"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{job.company}</h2>
                <p className="mt-1 text-sm text-accent">{job.role}</p>
                <p className="mt-2 font-mono text-xs tracking-eyebrow text-muted">
                  {job.period} · {job.location}
                </p>
              </div>
              <ul className="space-y-3">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-20">
        <SectionLabel index="02" label="STACK & COMPETENCIES" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fallbackSkills.map((col) => (
            <div key={col.group} className="rounded-2xl border border-border bg-panel p-5">
              <h3 className="font-mono text-xs tracking-eyebrow text-muted">{col.group}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {col.items.map((item) => (
                  <Chip key={item}>{item}</Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-20">
        <SectionLabel index="03" label="EDUCATION & CERTS" />
        <div className="space-y-px">
          {fallbackEducation.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 border-t border-border py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-muted">{item.org}</p>
              </div>
              <p className="font-mono text-xs tracking-eyebrow text-muted">{item.period}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
