import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiAngular,
  SiNodedotjs,
  SiExpress,
  SiGraphql,
  SiPostgresql,
  SiSupabase,
  SiSocketdotio,
  SiReactivex,
  SiTailwindcss,
  SiDocker,
  SiVercel,
  SiGit,
  SiAnthropic
} from 'react-icons/si';

// Two copies wrap as scroll displacement changes. No autoplay animation.

const TECH = [
  { label: 'TypeScript', Icon: SiTypescript },
  { label: 'JavaScript', Icon: SiJavascript },
  { label: 'React', Icon: SiReact },
  { label: 'Next.js', Icon: SiNextdotjs },
  { label: 'Angular', Icon: SiAngular },
  { label: 'Node.js', Icon: SiNodedotjs },
  { label: 'Express', Icon: SiExpress },
  { label: 'GraphQL', Icon: SiGraphql },
  { label: 'PostgreSQL', Icon: SiPostgresql },
  { label: 'Supabase', Icon: SiSupabase },
  { label: 'Socket.IO', Icon: SiSocketdotio },
  { label: 'RxJS', Icon: SiReactivex },
  { label: 'Tailwind', Icon: SiTailwindcss },
  { label: 'Docker', Icon: SiDocker },
  { label: 'Vercel', Icon: SiVercel },
  { label: 'Git', Icon: SiGit },
  { label: 'Claude', Icon: SiAnthropic }
];

function Lockup({ label, Icon, aria = true }) {
  return (
    <li
      className="flex shrink-0 items-center gap-2.5 text-muted transition-colors duration-300 ease-apple hover:text-ink"
      {...(aria ? {} : { 'aria-hidden': 'true' })}
    >
      <Icon size={22} aria-hidden="true" />
      <span className="text-body-sm font-medium tracking-tight">{label}</span>
    </li>
  );
}

export function TechMarquee({ className = '' }) {
  return (
    <div
      data-scene="ticker"
      className={`tech-ticker group relative w-full overflow-hidden
        [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
        [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div data-ticker-track className="flex w-max">
        <ul className="flex shrink-0 items-center gap-x-12 pr-12">
          {TECH.map((t) => (
            <Lockup key={t.label} {...t} />
          ))}
        </ul>
        {/* Duplicate copy for the seamless loop; hidden from assistive tech. */}
        <ul className="flex shrink-0 items-center gap-x-12 pr-12">
          {TECH.map((t) => (
            <Lockup key={`dup-${t.label}`} {...t} aria={false} />
          ))}
        </ul>
      </div>
    </div>
  );
}
