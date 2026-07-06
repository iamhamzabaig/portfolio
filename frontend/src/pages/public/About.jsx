import { Container } from '../../components/layout/Container.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { RevealScope } from '../../components/ui/RevealScope.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import {
  fallbackProfile,
  fallbackExperience,
  fallbackSkills,
  fallbackEducation
} from '../../utils/fallbackData.js';

function SectionLabel({ index, label }) {
  return (
    <RevealScope className="mb-10 flex items-baseline gap-4">
      <Eyebrow as="span" data-fade>{index}</Eyebrow>
      <h2 data-split className="font-display text-fluid-h3 font-semibold text-ink">{label}</h2>
      <span className="h-px flex-1 translate-y-[-2px] bg-border" />
    </RevealScope>
  );
}

export default function About() {
  const profileQuery = useProfile();
  const profile = profileQuery.data || fallbackProfile;

  return (
    <Container className="py-20 sm:py-24">
      {/* Intro */}
      <RevealScope immediate deps={[profile.name, profile.bio]} className="max-w-3xl">
        <Eyebrow data-fade>About</Eyebrow>
        <h1 data-split className="mt-3 font-display text-fluid-h1 font-semibold text-ink">
          {profile.name}
        </h1>
        <p data-fade className="mt-4 text-body text-muted">
          {fallbackProfile.role} · {fallbackProfile.location}
        </p>
        <p data-split className="mt-8 text-body-lg text-muted">{profile.bio || fallbackProfile.bio}</p>
      </RevealScope>

      {/* Experience */}
      <section className="mt-24">
        <SectionLabel index="01" label="Experience" />
        <div>
          {fallbackExperience.map((job) => (
            <article
              key={job.company}
              className="grid gap-5 border-t border-border py-9 md:grid-cols-[0.9fr_1.6fr]"
            >
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{job.company}</h3>
                <p className="mt-1 text-body-sm text-accent">{job.role}</p>
                <p className="mt-2 text-caption text-muted">
                  {job.period} · {job.location}
                </p>
              </div>
              <ul className="space-y-3">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3 text-body-sm text-muted">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-24">
        <SectionLabel index="02" label="Stack & competencies" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fallbackSkills.map((col) => (
            <div key={col.group} className="rounded-card bg-surface p-6">
              <h3 className="text-caption font-semibold uppercase tracking-[0.08em] text-muted">{col.group}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {col.items.map((item) => (
                  <Chip key={item} className="bg-panel">
                    {item}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-24">
        <SectionLabel index="03" label="Education & certifications" />
        <div>
          {fallbackEducation.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-body font-semibold tracking-tight text-ink">{item.title}</p>
                <p className="text-body-sm text-muted">{item.org}</p>
              </div>
              <p className="text-caption text-muted">{item.period}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
