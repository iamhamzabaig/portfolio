# Portfolio UI Port — codewithmukesh visual system

**Date:** 2026-06-20
**Branch:** feat/frontend-redesign
**Status:** Approved (design), pending implementation plan

## Goal

Re-skin the public portfolio so it adopts the **visual UI system** of
`codewithmukesh.com/resources/dotnet-webapi-interview-questions/`. This removes
the "vibe-coded" template feel (developer-violet glow, dot grid, pointer
parallax, boxed pill-nav) and replaces it with a disciplined, polished system.

**Port the UI, not the content.** All of Hamza Munawar's existing copy, data,
routes, and fallback content stay exactly as-is. Only presentation changes:
design tokens, fonts, component shapes, hero treatment, and a signature
email-capture CTA card.

## Non-goals

- No content/copy rewrites (hero text, stats, project data, bio all unchanged).
- No route or data-layer changes (React Query, API, AuthContext untouched).
- Admin area (`/admin/*`) is **out of scope** — behind login, not judged.
- No new dependencies (motion, lucide-react, tailwind already present).

## Reference signatures (extracted from the live site)

- **shadcn semantic token system**: `background / foreground / card / border /
  border-strong / muted-foreground / primary / ring`.
- **Primary** brand = indigo `#4C33D8` (light), violet `#7C66F0` (dark).
- **Fonts**: Outfit (display, `tracking-[-0.035em]`), Figtree (body),
  JetBrains Mono (labels).
- **Hero headline**: two weights — lead in `font-light text-muted-foreground`,
  keyword in `font-bold text-foreground` with a translucent primary
  underline-bar (`absolute -bottom-1 h-2 rounded-full`, `color-mix(in oklab,
  var(--primary) 50%, transparent)`). Sizes `text-[40px] sm:text-[60px]
  md:text-[72px]`, `text-balance`.
- **Micro-labels**: `text-[11px] uppercase tracking-[0.16em] tabular-nums`,
  primary or muted, sometimes numbered `01 · …`.
- **Buttons**: `rounded-lg h-11 px-5 text-[15px] font-medium transition-all
  active:scale-[0.98] focus-visible:ring-2 ring-offset-2`.
- **Cards**: `rounded-lg border border-border bg-card`, `hover:border-strong`.
- **Inputs**: `h-12 rounded-lg border bg-background px-4 text-sm
  focus-visible:border-primary focus-visible:outline-2 outline-offset-2
  outline-primary`.
- **Nav**: pill links `rounded-full px-3.5 py-1.5 text-[13px]
  text-muted-foreground hover:text-foreground` (no boxed bar, no sliding
  indicator).
- **Pulsing-dot** status indicator (`pulse-dot`, `bg-primary`).

## Token system

Re-skin the existing `--var` channel system in `src/styles/index.css` (keep the
`rgb(var(--x) / <alpha-value>)` approach so all `/opacity` utilities keep
working). Add one new token: `--border-strong`.

Existing token names map to mukesh semantics:
`bg→background`, `panel→card`, `surface→muted surface`, `border→border`,
`ink→foreground`, `muted→muted-foreground`, `accent→primary`.

| token (`--x`)   | light (R G B)   | dark (R G B)    |
|-----------------|-----------------|-----------------|
| `--bg`          | `252 252 253`   | `11 10 15`      |
| `--panel`       | `255 255 255`   | `20 19 26`      |
| `--surface`     | `247 246 250`   | `26 25 34`      |
| `--border`      | `231 230 234`   | `38 38 48`      |
| `--border-strong` | `212 211 217` | `52 52 63`      |
| `--ink`         | `21 19 26`      | `244 242 238`   |
| `--muted`       | `91 91 102`     | `160 160 171`   |
| `--accent`      | `76 51 216`     | `124 102 240`   |

`tailwind.config.js`: add `borderStrong: 'rgb(var(--border-strong) / <alpha>)'`.
Drop the unused `teal/amber/danger` only if nothing references them (verify).
Remove `bg-grid-faint` background image + `glow` shadow (no longer used).

### Contrast check
- Body text uses `--ink` on `--bg` — AAA both themes.
- `--accent` is used for UI/large text/borders/fills, not small body copy.
  `#4C33D8` on white = ~7:1 (AA+). White on `#4C33D8` fill = ~7:1.

## Fonts

`index.html`: replace the Google Fonts link —
`Outfit:wght@400;500;600;700` + `Figtree:wght@400;500;600` +
`JetBrains+Mono:wght@400;500`.
`tailwind.config.js` `fontFamily`: `display: ['Outfit', ...]`,
`sans: ['Figtree', ...]`, `mono: ['"JetBrains Mono"', ...]`.

## Component specs

- **Button** (`ui/Button.jsx`): base `inline-flex items-center justify-center
  gap-1.5 font-medium rounded-lg transition-all active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
  focus-visible:ring-offset-2 focus-visible:ring-offset-bg h-11 px-5
  text-[15px]`. Variants: `primary` = `bg-accent text-white hover:bg-accent/90`;
  `outline` = `bg-panel text-ink border border-border hover:border-borderStrong`.
- **Card** (`ui/Card.jsx`): `rounded-lg border border-border bg-panel`,
  optional `hover:border-borderStrong transition-colors`.
- **Chip** (`ui/Chip.jsx`): `rounded-full border border-border bg-surface
  px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em]
  text-muted tabular-nums`.
- **Input/Textarea**: `h-12` (textarea `min-h-[140px] py-3`) `rounded-lg border
  border-border bg-bg px-4 text-sm text-ink placeholder:text-muted/70
  focus-visible:border-accent focus-visible:outline-2 outline-offset-2
  outline-accent`.
- **MicroLabel** (small helper or inline): `text-[11px] font-medium uppercase
  tracking-[0.16em] tabular-nums`.
- **Eyebrow** (Home): recolor index to `text-accent`, keep divider pattern.

## Per-page changes

- **Navbar**: pill links (rounded-full, no boxed container / no `layoutId`
  sliding bar — active = `text-ink`, others `text-muted hover:text-ink`). Keep
  `HexMark` logo recolored to indigo, keep `ThemeToggle`. Admin link → mukesh
  "Subscribe"-style filled button.
- **Footer**: re-skin to tokens, hairline top border, mono micro-labels.
- **Home**:
  - Hero: remove `bg-grid-faint`, the `bg-accent/20 blur-[120px]` glow, and the
    pointer-parallax (`useMotionValue/useSpring/useTransform`, `handlePointer`).
    Rebuild as centered editorial hero with the two-weight + underline-bar
    headline. Keep `heroStagger`/`heroItem` (subtle). Eyebrow status pill →
    mukesh preview-link style.
  - Stats band, Selected work, How I work: token re-skin, `rounded-lg` cards,
    micro-labels.
  - **New closing CTA band**: compact email-capture-style card (header strip +
    pulsing dot + status label + a single primary CTA to `/contact`).
- **Projects** + **ProjectGrid/ProjectCard**: `rounded-lg` cards, hairline
  borders, hover `border-strong`, mono tag chips, indigo accents.
- **ProjectDetail**: token re-skin, micro-labels, button restyle.
- **About**: token re-skin, two-weight section headings where it reads well.
- **Contact** + **ContactForm**: rebuild as the signature email-capture **card**
  — bordered `rounded-lg` card, header strip (pulsing dot + `Available for
  work` + a `Step`/status micro-label), `h-12` inputs, filled primary submit.
  Keep existing form fields, validation, and submit mutation.

## Motion

Restrained, like the reference. Keep the hero entrance stagger. Remove the
pointer-reactive glow. Keep `ThemeContext` view-transition reveal as-is. Respect
`prefers-reduced-motion` (already handled in `index.css`).

## New CSS

Add to `index.css`: `.pulse-dot` keyframe (ping-style opacity/scale) for the
status dot, gated by `prefers-reduced-motion`.

## Files touched

`index.html`, `tailwind.config.js`, `src/styles/index.css`,
`src/components/ui/{Button,Card,Chip,Input,Textarea}.jsx`,
`src/components/layout/{Navbar,Footer}.jsx`,
`src/pages/public/{Home,Projects,ProjectDetail,About,Contact}.jsx`,
`src/features/projects/components/{ProjectGrid,ProjectCard}.jsx`,
`src/features/contact/components/ContactForm.jsx`.
(Admin files untouched.)

## Acceptance

- No developer-violet glow, dot grid, or pointer parallax anywhere.
- Outfit/Figtree/JetBrains Mono render; indigo primary in both themes.
- Hero shows two-weight headline + underline-bar.
- Contact is the email-capture card with pulsing-dot header.
- Light/dark toggle + view-transition still work; reduced-motion respected.
- All existing content/data/routes unchanged; `npm run build` passes.
