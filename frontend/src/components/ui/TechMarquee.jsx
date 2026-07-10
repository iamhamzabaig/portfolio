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

// Infinite, seamless marquee of the tech stack as monochrome brand marks. The
// track holds two identical copies; the `marquee` keyframe (tailwind.config.js)
// shifts it one copy (-50%) for a seamless loop. Icons inherit currentColor, so
// they read as a quiet grayscale logo cloud that lifts to full-ink on hover.
// Edges fade via a mask (theme-independent); motion pauses on hover and is
// halted entirely by the global prefers-reduced-motion CSS.

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
      className={`group relative w-full overflow-hidden
        [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
        [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
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
