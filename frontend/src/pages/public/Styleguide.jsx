import { useEffect, useState } from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Container } from '../../components/layout/Container.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/Dialog.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

// Living catalog of the design system — renders the tokens and components straight
// from source, so it can't drift from the real thing. Doubles as proof-of-craft.
const surfaceTokens = [
  { name: 'bg', cls: 'bg-bg' },
  { name: 'panel', cls: 'bg-panel' },
  { name: 'surface', cls: 'bg-surface' },
  { name: 'border', cls: 'bg-border' },
  { name: 'ink', cls: 'bg-ink' },
  { name: 'muted', cls: 'bg-muted' },
  { name: 'accent', cls: 'bg-accent' }
];

const statusTokens = [
  { name: 'success', cls: 'bg-success' },
  { name: 'danger', cls: 'bg-danger' },
  { name: 'warning', cls: 'bg-warning' },
  { name: 'info', cls: 'bg-info' }
];

const typeScale = [
  { token: 'text-fluid-hero', label: 'Hero' },
  { token: 'text-fluid-h1', label: 'Heading 1' },
  { token: 'text-fluid-h2', label: 'Heading 2' },
  { token: 'text-fluid-h3', label: 'Heading 3' },
  { token: 'text-body-lg', label: 'Body large' },
  { token: 'text-body', label: 'Body' },
  { token: 'text-body-sm', label: 'Body small' },
  { token: 'text-caption', label: 'Caption' },
  { token: 'text-micro uppercase', label: 'Micro' }
];

const radii = [
  { name: 'control', cls: 'rounded-control' },
  { name: 'media', cls: 'rounded-media' },
  { name: 'card', cls: 'rounded-card' },
  { name: 'full', cls: 'rounded-full' }
];

const elevations = [
  { name: 'soft', cls: 'shadow-soft' },
  { name: 'lift', cls: 'shadow-lift' },
  { name: 'overlay', cls: 'shadow-overlay' }
];

const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger'];

function Section({ title, description, children }) {
  return (
    <section className="border-t border-border py-14">
      <h2 className="font-display text-fluid-h3 font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-body-sm text-muted">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function Styleguide() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep the design-system page reachable by link but out of search results, so it
  // never competes with the real pages. Applied per-route and cleaned up on exit.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <Container className="py-20 sm:py-24">
      <Eyebrow>Design system</Eyebrow>
      <h1 className="mt-3 font-display text-fluid-h1 font-semibold tracking-tight text-ink">Styleguide</h1>
      <p className="mt-5 max-w-2xl text-body-lg text-muted">
        The tokens and components this site is built from — rendered live from source so the catalog
        can never drift from production.
      </p>

      {/* Colors */}
      <Section title="Color" description="Theme-aware channels — every swatch shifts between light and dark.">
        <p className="text-caption font-medium uppercase tracking-[0.06em] text-muted">Surfaces &amp; text</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {surfaceTokens.map((t) => (
            <div key={t.name}>
              <div className={`h-16 rounded-control border border-border ${t.cls}`} />
              <p className="mt-2 text-caption text-muted">{t.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-caption font-medium uppercase tracking-[0.06em] text-muted">Status</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statusTokens.map((t) => (
            <div key={t.name}>
              <div className={`h-16 rounded-control ${t.cls}`} />
              <p className="mt-2 text-caption text-muted">{t.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Type */}
      <Section title="Typography" description="Fluid headline ramp over a fixed body scale, each with a paired line-height.">
        <div className="space-y-5">
          {typeScale.map((t) => (
            <div key={t.token} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-border/60 pb-5">
              <span className={`${t.token} font-display font-semibold text-ink`}>{t.label}</span>
              <code className="text-caption text-muted">{t.token}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* Radius */}
      <Section title="Radius" description="Named roles per surface type.">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {radii.map((r) => (
            <div key={r.name}>
              <div className={`h-24 border border-border bg-surface ${r.cls}`} />
              <p className="mt-2 text-caption text-muted">{r.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Elevation */}
      <Section title="Elevation" description="A diffuse, low-contrast ladder.">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {elevations.map((e) => (
            <div key={e.name}>
              <div className={`h-24 rounded-card bg-panel ${e.cls}`} />
              <p className="mt-3 text-caption text-muted">{e.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons" description="One component: variant × size × iconOnly × loading.">
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button iconOnly size="sm" variant="ghost" aria-label="Delete">
            <Trash2 aria-hidden="true" size={17} />
          </Button>
          <Button variant="link">
            Learn more <ArrowRight aria-hidden="true" size={16} />
          </Button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges" description="Tags, status chips, and on-media overlays.">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>React</Badge>
          <Badge tone="accent" size="xs">
            New
          </Badge>
          <Badge tone="solid" size="xs">
            Featured
          </Badge>
          <Badge tone="onMedia" size="xs">
            Demo
          </Badge>
        </div>
      </Section>

      {/* Forms */}
      <Section title="Form controls" description="Labelled, with wired aria-invalid / described-by errors.">
        <div className="grid max-w-md gap-4">
          <Input id="sg-name" label="Name" placeholder="Jane Doe" />
          <Input id="sg-email" label="Email" placeholder="jane@example.com" error="Use a valid email" />
          <Textarea id="sg-msg" label="Message" placeholder="Tell me about your project…" />
        </div>
      </Section>

      {/* Feedback */}
      <Section title="Feedback" description="Toasts and the accessible confirm dialog.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => toast({ tone: 'success', message: 'Saved successfully.' })}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={() => toast({ tone: 'error', message: 'Something went wrong.' })}>
            Error toast
          </Button>
          <Button variant="secondary" onClick={() => toast({ tone: 'info', message: 'Heads up — this is an info toast.' })}>
            Info toast
          </Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Open confirm dialog
          </Button>
        </div>
        <Card className="mt-8 p-6">
          <p className="text-body-sm text-muted">
            Cards use <code>rounded-card</code>, a hairline border, and <code>shadow-soft</code>.
          </p>
        </Card>
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast({ tone: 'success', message: 'Confirmed.' });
        }}
        title="Delete this item?"
        description="This is a demo dialog — nothing will actually be deleted."
        confirmLabel="Delete"
      />
    </Container>
  );
}
