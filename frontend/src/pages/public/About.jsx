import { Container } from '../../components/layout/Container.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { useProfile } from '../../features/profile/api/profile.queries.js';
import {
  fallbackProfile,
  fallbackExperience,
  fallbackSkills,
  fallbackEducation
} from '../../utils/fallbackData.js';

function SectionLabel({ index, label }) {
  return (
    <div className="mb-10 flex items-baseline gap-4">
      <Eyebrow as="span">{index}</Eyebrow>
      <h2 className="font-display text-fluid-h3 font-semibold text-ink">{label}</h2>
      <span className="h-px flex-1 translate-y-[-2px] bg-border" />
    </div>
  );
}

export default function About() {
  const profileQuery = useProfile();
  const profile = profileQuery.data || fallbackProfile;

  return (
    <Container className="py-20 sm:py-24">
      {/* Intro */}
      <div className="max-w-3xl">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-3 font-display text-fluid-h1 font-semibold text-ink">
          {profile.name}
        </h1>
        <p className="mt-4 text-body text-muted">
          {fallbackProfile.role} · {fallbackProfile.location}
        </p>
        <p className="mt-8 text-body text-muted">{profile.bio || fallbackProfile.bio}</p>
      </div>

      {/* Experience */}
      <section className="mt-24">
        <SectionLabel index="01" label="Experience" />
        {/* Vertical timeline — a continuous rail (each row's left border) with an
            accent node per role, content flowing to the right. */}
        <div>
          {fallbackExperience.map((job) => (
            <article
              key={job.company}
              className="relative border-l border-border pb-12 pl-8 last:pb-0 sm:pl-10"
            >
              {/* Node — punches through the rail via a bg-colored ring. */}
              <span
                aria-hidden="true"
                className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full border-2 border-bg bg-accent"
              />
              <p className="text-caption text-muted">
                {job.period} · {job.location}
              </p>
              <h3 className="mt-1 font-display text-fluid-h3 font-semibold text-ink">{job.company}</h3>
              <p className="mt-1 text-body-sm text-accent">{job.role}</p>
              <ul className="mt-4 space-y-3">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3 text-caption text-muted">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
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
