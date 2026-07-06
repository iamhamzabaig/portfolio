// Small pill label. Replaces the three parallel inline-pill implementations that
// had drifted apart (project tags, the "New" chip, the Featured/Demo overlays).
//   tone    — neutral (tag) | accent (soft) | solid (accent fill) | onMedia (over imagery)
//   size    — sm (default tag) | xs (uppercase micro badge)
const base = 'inline-flex items-center gap-1 rounded-full font-medium';

const tones = {
  neutral: 'bg-surface text-muted ring-1 ring-border/60',
  accent: 'bg-accent/10 text-accent',
  solid: 'bg-accent text-on-accent',
  onMedia: 'bg-white/85 text-ink backdrop-blur'
};

const sizes = {
  sm: 'px-2.5 py-1 text-caption',
  xs: 'px-2 py-0.5 text-micro font-semibold uppercase'
};

export function Badge({ tone = 'neutral', size = 'sm', className = '', children, ...props }) {
  return (
    <span className={`${base} ${sizes[size]} ${tones[tone] || tones.neutral} ${className}`} {...props}>
      {children}
    </span>
  );
}
