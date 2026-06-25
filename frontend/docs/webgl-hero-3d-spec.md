# Spec: Interactive WebGL 3D Centerpiece in Hero (React Three Fiber)

> Implementation spec for the frontend owner (Codex). Authored during planning by Claude, who does not edit `frontend/`. Build to this; adjust as needed and report deviations.

## Context

Frontend: React 18.3 + Vite 6 + Tailwind 3.4 + Motion (framer-motion successor). The hero in `src/pages/public/Home.jsx` has a CSS grid background and a pointer-reactive blurred **glow sphere** (a `motion.div` driven by `glowX/glowY` motion values); the headline drifts via `headX/headY`. No WebGL/Three.js exists yet.

Goal: add an **interactive 3D centerpiece** — a faceted geometry object, tinted in the brand violet accent, auto-rotating and tilting toward the pointer — while protecting the Lighthouse-88 target and accessibility. The current glow sphere becomes the graceful fallback.

**Approved direction:** Interactive 3D centerpiece · React Three Fiber + drei · lazy-load with CSS fallback + mobile/reduced-motion degradation.

---

## Dependency compatibility (CRITICAL — React 18, not 19)

React here is **18.3.1**. React Three Fiber v9 and drei v10 require **React 19**. Pin the v8/v9 line:

```
three@^0.169
@react-three/fiber@^8.17     # v8 = React 18; v9 needs React 19 — DO NOT install v9
@react-three/drei@^9.114     # v9 pairs with fiber v8; v10 needs fiber v9
```

Install in `frontend/` only. No GLB/HDR assets needed (geometry + lights, asset-free) — keeps bundle and first paint lean.

---

## Architecture

Four new files under `frontend/src/components/three/`, plus a small edit to `Home.jsx`. The three.js bundle (~600KB–1MB) must live in a **dynamically-imported chunk** so it never enters the initial route or the mobile path.

```
HeroVisual (capability gate + Suspense)        <- public API, used by Home.jsx
 ├─ useShouldRender3D()  -> render=false on no-WebGL / mobile / low-end
 │     false ──────────────► <StaticGlow/>      (current CSS glow; three never loaded)
 │     true  ──► <Suspense fallback={<StaticGlow/>}>
 │                  React.lazy(() => import('./HeroScene'))   <- the only three import
 └─ animate flag -> passed to HeroScene (reduced-motion => frozen frame)
```

### Files (all NEW unless noted)

1. **`frontend/src/components/three/StaticGlow.jsx`**
   Extract the existing glow-sphere markup from `Home.jsx` (the `motion.div` with `bg-accent/20 blur-[120px]`, driven by `glowX/glowY`). Reused in three places: Suspense fallback, mobile/low-end path, reduced-motion-if-skipped. Accepts pointer motion values as props (`{ glowX, glowY }`) so behavior matches today. DRY — single source for the glow.

2. **`frontend/src/components/three/useShouldRender3D.js`**
   Pure hook. Returns `{ render: boolean, animate: boolean }`.
   `render=false` when ANY of:
   - no WebGL context (`canvas.getContext('webgl2') || ...('webgl')` is null),
   - coarse pointer / small viewport (`matchMedia('(pointer: coarse)')` or `innerWidth < 768`),
   - low-end: `navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 4` (guard undefined).
   `animate=false` when `matchMedia('(prefers-reduced-motion: reduce)')` — do NOT skip 3D for reduced-motion; render it **static** (frozen frame).
   Re-evaluate on debounced resize and on the reduced-motion media-query `change`. SSR-safe (`typeof window` guards).

3. **`frontend/src/components/three/HeroScene.jsx`** — **default export** (lazy target; sole module importing `three`/fiber/drei so the chunk stays isolated).
   - `<Canvas dpr={[1, 2]} frameloop={animate ? 'always' : 'demand'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 4], fov: 45 }}>`
   - Object: faceted **icosahedron** (`<icosahedronGeometry args={[1.3, 0]} />`) — techy/engineer, matches mono font + hex-logo brand. Wrap in drei `<Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>`. Material: drei `<MeshDistortMaterial distort={0.25} speed={1.5} roughness={0.2} metalness={0.6} />` accent-tinted (premium), OR `meshStandardMaterial` + wireframe overlay (crystalline). Recommend distort; keep wireframe as a variant constant.
   - Lighting (asset-free, no Environment/HDR): low `ambientLight` + one `directionalLight` + one accent-colored `pointLight`.
   - **Pointer drive:** do NOT add a new listener. `Home.jsx` already computes `glowX/glowY` from `onPointerMove`. Pass those motion values in; in a `useFrame`, read them (`glowX.get()`) and `lerp` mesh rotation toward a small tilt + constant slow auto-spin when `animate`. When `!animate`, render once at a neutral pose.
   - **Theme color:** read `--accent` from `getComputedStyle(document.documentElement)` → `new THREE.Color('rgb(' + tokens.join(',') + ')')`, recomputed on theme change via existing `useTheme()` in `src/context/ThemeContext.jsx` (light `99 84 224` / dark `124 108 242`). Single source = the CSS token.
   - **Perf guards:** drei `<PerformanceMonitor onDecline={() => setDpr(1)}>` + `<AdaptiveDpr pixelated />`. Pause when hero scrolls out of view (IntersectionObserver; hero at page top) — drop to `frameloop="demand"` when not intersecting.

4. **`frontend/src/components/three/HeroVisual.jsx`**
   Orchestrator and the only thing `Home.jsx` imports. Calls `useShouldRender3D()`; if `!render` returns `<StaticGlow {...pointer} />`. Else `<Suspense fallback={<StaticGlow {...pointer} />}><LazyHeroScene animate={animate} pointer={pointer} /></Suspense>`, where `LazyHeroScene = React.lazy(() => import('./HeroScene'))`. Props: `pointer={{ glowX, glowY }}` from Home.

### Edit (EXISTING)

5. **`frontend/src/pages/public/Home.jsx`** (hero section, ~lines 72–102)
   - Keep grid background and headline parallax untouched.
   - Replace the inline glow `motion.div` with `<HeroVisual pointer={{ glowX, glowY }} />`.
   - Keep `onPointerMove={handlePointer}` / `onPointerLeave={resetPointer}` on `<section>` — already feed the motion values now shared with the 3D object. No new pointer plumbing.

### Optional build tweak

6. **`frontend/vite.config.js`** — dynamic `import()` already produces a separate chunk; optionally add `build.rollupOptions.output.manualChunks` naming the three chunk (e.g. `three-vendor`) for clearer output + caching. Not required for correctness.

---

## Why this design

- **Reuses existing pointer infra** (`glowX/glowY/handlePointer`) — 3D object and fallback track the same signal, no second pointer system.
- **`StaticGlow` extraction** removes duplicated markup and gives a real, on-brand fallback (not a blank box) for Suspense, mobile, and no-WebGL.
- **Isolated lazy chunk** keeps three.js out of the initial bundle and entirely off mobile/low-end — directly protects Lighthouse 88.
- **Theme-token-driven color** keeps light/dark correct with zero hardcoded duplication.
- **Asset-free geometry** avoids GLB/HDR network cost and a loader pipeline (none exists today).

---

## Verification

**Unit (Vitest + jsdom — already configured):** jsdom has no WebGL — do NOT render a real `<Canvas>`. Test pure logic:
- `useShouldRender3D` returns `{ render: false }` when `matchMedia`/`getContext` mocks report no-webgl / coarse pointer / small viewport; `{ animate: false }` under reduced-motion.
- `HeroVisual` renders `StaticGlow` when `render` is false; mock `./HeroScene` to assert it lazy-imports only when `render` is true.
- `StaticGlow` renders with given motion values.

**Manual (`cd frontend && npm run dev`):**
1. Desktop wide: icosahedron visible, auto-spins, tilts toward cursor, floats.
2. Theme toggle: object color switches violet light↔dark with the page.
3. Resize <768 / DevTools mobile: static glow shows, AND Network tab confirms the `three` chunk is NOT downloaded.
4. OS "Reduce motion" on: object renders as a frozen frame (no spin/drift).
5. `npm run build`: separate three/fiber/drei chunk in `dist/assets`; main entry chunk size unchanged vs. before.
6. Lighthouse (desktop + mobile) ≥ 88; no new a11y violations.
