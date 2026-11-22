import { Container } from '../../components/layout/Container.jsx';
import { CodeBlock, SectionTitle } from '../../components/ide/CodeBlock.jsx';
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
      <h2 data-motion="heading" className="font-display text-fluid-h3 font-semibold text-ink"><span aria-hidden="true" className="syn-keyword">## </span>{label}</h2>
      <span className="h-px flex-1 translate-y-[-2px] bg-border" />
    </div>
  );
}

// Turns a plain object into JSON-looking token lines for CodeBlock.
function jsonLines(name, obj) {
  const value = (v) =>
    typeof v === 'boolean' ? ['keyword', String(v)] : Array.isArray(v) ? null : ['string', JSON.stringify(v)];
  const lines = [[['keyword', 'export const '], ['fn', name], ['plain', ' = {']]];
  Object.entries(obj).forEach(([key, v]) => {
    const k = /^[a-z]+$/i.test(key) ? key : JSON.stringify(key);
    if (Array.isArray(v)) {
      lines.push([['plain', `  ${k}: [`]]);
      v.forEach((item) => lines.push([['plain', '    '], ['string', JSON.stringify(item)], ['plain', ',']]));
      lines.push([['plain', '  ],']]);
    } else {
      lines.push([['plain', `  ${k}: `], value(v), ['plain', ',']]);
    }
  });
  lines.push([['plain', '};']]);
  return lines;
}

export default function About() {
  const profileQuery = useProfile();
  const profile = profileQuery.data || fallbackProfile;

  return (
    <Container className="py-20 sm:py-24">
      {/* Intro */}
      <div className="max-w-3xl">
        <SectionTitle as="h1" file="about.md">{profile.name}</SectionTitle>
        <p className="mt-8 text-body text-muted">{profile.bio || fallbackProfile.bio}</p>
        <CodeBlock
          className="mt-10"
          file="profile.ts"
          lines={jsonLines('profile', {
            role: fallbackProfile.role,
            location: fallbackProfile.location,
            email: fallbackProfile.email,
            openToWork: true
          })}
        />
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
              <p className="mt-1 font-mono text-body-sm syn-type">{job.role}</p>
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
        <CodeBlock
          file="stack.ts"
          lines={jsonLines('stack', Object.fromEntries(fallbackSkills.map((col) => [col.group, col.items])))}
        />
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
              <p className="font-mono text-caption syn-number">{item.period}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
