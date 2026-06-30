# HeroUI v2 Modern Rebuild + Mobile-App Shell — Design Spec

- **Date:** 2026-06-30
- **Scope:** Frontend (`frontend/`) — public pages + admin
- **Stack target:** React 18.3, Tailwind 3.4, HeroUI v2, framer-motion, Supabase (unchanged)
- **Status:** Approved design, pending implementation plan

## 1. Goal

Rebuild the portfolio frontend on **HeroUI v2** with a **lean-modern aesthetic** (large radii,
glass/blur surfaces, gradient accents, soft shadow/glow), and make the **mobile experience feel
like a native app** (bottom tab bar, slide-up sheets, page transitions, app-grade touch behavior).
Keep the site's signature elements (3D hero, light/dark toggle, Space Grotesk display type,
framer-motion reveals) and push them modern. Admin gets the same HeroUI foundation but a
**lighter** treatment — functional and clean, not the full flourish.

## 2. Decisions (locked)

| Decision | Choice |
| --- | --- |
| Library | HeroUI **v2** (stable) — stays on React 18 + Tailwind 3, no React 19 / Tailwind 4 migration |
| Scope | Public **and** admin |
| Visual direction | **Lean HeroUI modern** — rounded-2xl, glass blur, gradient accents, soft shadow/glow |
| Admin treatment | **Lighter** — same foundation, fewer flourishes, prioritize clarity/density |
| Bottom tab bar | **Mobile only** (desktop keeps glass top nav) |
| Mobile patterns | Bottom tab bar + slide-up sheets + page transitions + app touches |
| Keep | 3D hero, light/dark toggle, Space Grotesk display, motion/reveals (modernized) |
| Execution | Incremental, page-by-page, behind a theme bridge; shippable after every phase |

## 3. Non-goals

- No React 19 / Tailwind 4 / react-three-fiber v9 upgrade (that was the rejected v3 path).
- No backend / Supabase / data-model changes.
- No new pages or features — this is a visual + interaction rebuild of existing surfaces.
- No unrelated refactors beyond what the rebuild touches.

## 4. Constraints & compatibility notes

- **`framer-motion` peer dependency.** HeroUI v2 peers on `framer-motion`. The project currently
  has `motion@12` (the renamed successor package). Foundation phase adds `framer-motion` as a
  dependency so HeroUI's internal animations resolve, while existing `motion/react` imports in app
  code continue to work. Reconcile, do not mass-rewrite imports.
- **Tailwind plugin coexistence.** `heroui()` plugin is added to `tailwind.config.js` alongside the
  existing `theme.extend` tokens. HeroUI's `content` glob
  (`./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}`) must be added so its classes are not
  purged. `darkMode: 'class'` stays.
- **Token bridge, not token replacement.** Existing CSS variables (`--bg`, `--panel`, `--surface`,
  `--border`, `--ink`, `--muted`, `--accent`) and Tailwind color tokens remain during migration so
  un-migrated pages keep rendering. HeroUI themes are configured from the same palette values.
- **Tests must stay green.** `frontend/tests` + `vitest` run after each phase; update selectors when
  a component is swapped, never leave the suite red between phases.
- **Reduced motion.** The existing `prefers-reduced-motion` block in `styles/index.css` is honored
  by all new motion (page transitions, sheets, tab indicator).
- **Existing view-transition theme toggle** (circular reveal) is preserved and must keep working
  with the new shell.

## 5. Architecture

### 5.1 Provider + routing
- `main.jsx`: wrap the tree in `<HeroUIProvider navigate={navigate}>` so HeroUI `Link`/pressable
  routing uses react-router, plus `<ToastProvider>` for toasts. Keep existing
  `ThemeContext`/`AuthContext`/`QueryClientProvider` ordering.
- HeroUI dark mode is driven by the existing `.dark` class on `<html>` from `ThemeContext` — no
  second theme system.

### 5.2 Theme bridge (`tailwind.config.js` + theme config)
- Add `heroui({ themes: { light, dark } })` with:
  - `primary` = violet (`#6354e0` light / `#7c6cf2` dark) with sensible foreground.
  - `background` / `content1..4` / `default` / `divider` mapped from `--bg/--panel/--surface/--border`.
  - Global `radius` scaled up (large) and `boxShadow` softened for the modern look.
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (eyebrow/mono) wired through the
  existing `fontFamily` extend; HeroUI components inherit body font.

### 5.3 Modern surface utilities (`styles/index.css` additions)
- `.glass` — translucent panel + `backdrop-blur`, theme-aware via existing channels.
- `.soft-card` — rounded-2xl + soft shadow (modern card baseline).
- Gradient accent helper for primary CTAs; hover glow.
- All additive; existing utilities untouched.

### 5.4 App shell + navigation
- **`AppShell`** (wraps `PublicLayout`): renders a glass top nav on `md+`, a condensing sticky
  header + **fixed bottom `TabBar` on mobile only** (`md:hidden`).
- **`TabBar`** — Home / Projects / About / Contact, icon + label, `env(safe-area-inset-bottom)`
  padding, active indicator via framer-motion `layoutId` spring (reuses current nav pattern).
  Mobile only; desktop never shows it.
- **Sheets** — HeroUI `Drawer` (bottom placement, drag handle) for mobile menu, project filters,
  and the lightbox; HeroUI `Modal` for dialogs/confirms.
- **Page transitions** — `AnimatePresence` around the routed `Outlet`: slide-in on navigate, fade;
  reduced-motion = instant. Applied in `PublicLayout` (and `AdminLayout` at a lighter intensity).
- **App touches** — 44px+ tap targets, sticky header condenses on scroll, active-press states, no
  hover-only affordances, `-webkit-tap-highlight-color` already cleared.

### 5.5 Component migration map (custom → HeroUI)
| Current | Target |
| --- | --- |
| `ui/Button` | HeroUI `Button` (gradient variant for primary) |
| `ui/Card` | HeroUI `Card` + `.soft-card` |
| `ui/Chip` | HeroUI `Chip` |
| `ui/Input`, `ui/Textarea` | HeroUI `Input` / `Textarea` |
| `ui/Spinner` | HeroUI `Spinner` / `Skeleton` (skeletons for content loads) |
| mobile menu (Navbar) | `Drawer` (bottom sheet) |
| lightbox | full-screen `Drawer`/`Modal` |
| `CountUp`, `Sparkline`, `Reveal*` | **kept** (compose alongside HeroUI) |

Bespoke editorial pieces (3D hero, eyebrow rows, numbered sections, count-up stats, sparklines)
stay custom and are restyled onto modern surfaces — HeroUI provides behavior/primitives, not a
wholesale replacement of distinctive layout.

## 6. Per-portion plans

### Public
- **Home** — keep 3D hero (`HeroVisual`); surfaces → glass; CTAs → gradient HeroUI `Button`; stats
  + capabilities → soft `Card` with hover glow; `Skeleton` while featured projects load.
- **Projects** — HeroUI `Card` grid; filters as `Chip`/`Tabs` on desktop → bottom **sheet** on
  mobile; `Skeleton` grid while loading (replaces flashing/spinner).
- **ProjectDetail** — media header, HeroUI `Image`; gallery opens a **full-screen sheet** lightbox
  on mobile; `Tabs` for sections; sticky bottom CTA.
- **Contact** — HeroUI `Input`/`Textarea`/`Button` form, inline zod validation, success `Toast`.
- **About** — editorial timeline restyled on modern surfaces.
- **NotFound** — minimal modern empty state.

### Admin (lighter treatment)
Same HeroUI primitives and theme, but density- and clarity-first: minimal gradients/glow, standard
radii, no page-transition flourish beyond a simple fade. Bottom tab bar is **not** used in admin;
mobile admin uses a drawer.
- **Login** — centered `Card` + `Input` + `Button`.
- **AdminLayout** — desktop sidebar; mobile drawer nav; light fade transitions.
- **Dashboard** — stat `Card`s, plain.
- **Messages** — HeroUI `Table` on desktop → card list on mobile; message body in a `Drawer`.
- **ProjectsAdmin** — table/cards; row actions in `Dropdown` or sheet; reuse existing manual sort
  order field.
- **ProjectEditor / ProfileAdmin** — HeroUI `Input`/`Select`/`Switch`/file upload; sticky save bar.

## 7. Accessibility & performance

- HeroUI is built on React Aria — focus management, keyboard nav, and ARIA come for free; preserve
  it (don't override roles/labels).
- Honor `prefers-reduced-motion` for page transitions, sheets, and the tab indicator.
- Lazy-load the r3f hero; keep `/admin` code-split; import HeroUI per-component to stay
  tree-shakeable; watch the production bundle size across phases.

## 8. Rollout phases (each independently shippable, tests green)

0. **Foundation** — deps (`@heroui/react`, `framer-motion`), provider wrap, Tailwind plugin +
   content glob, theme bridge, modern surface utilities. No visible change; custom + HeroUI coexist.
1. **App shell + navigation** — `AppShell`, mobile bottom `TabBar`, glass top nav, page
   transitions, sheet/drawer scaffolding. The app-feel skeleton.
2. **Shared primitives** — swap Button / Card / Input / Textarea / Chip / Spinner → HeroUI,
   component-by-component, fixing tests as each lands.
3. **Public reskin** — Home → Projects → ProjectDetail → Contact → About.
4. **Admin reskin (lighter)** — Login → AdminLayout → Dashboard → Messages → ProjectsAdmin →
   ProjectEditor/ProfileAdmin.
5. **Polish** — toasts, skeletons, micro-interactions, a11y pass, bundle check, reduced-motion QA.

## 9. Success criteria

- Public site renders the lean-modern HeroUI look in light and dark, brand identity intact.
- On a phone: fixed bottom tab bar, slide-up sheets with drag handle, animated route transitions,
  safe-area-respecting layout, 44px+ targets — reads as an app, not a scrolled website.
- Admin is clean and functional on the same foundation, lighter styling, drawer nav on mobile.
- 3D hero, light/dark toggle, Space Grotesk, and motion/reveals all preserved.
- `vitest` suite green; production bundle not materially regressed; reduced-motion respected.
