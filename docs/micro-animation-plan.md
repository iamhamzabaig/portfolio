# Micro-animation plan

Goal: the site should feel physical. Every click, hover, tab change and route change gives a small, springy response, and none of it gets in the way.

## Rules (from research)

- Use **springs** for anything the user moves or changes, like tabs, toggles, drag, press, and indicators. They can be interrupted partway through and still feel right. Default: `{ type: 'spring', stiffness: 380, damping: 32 }` (snappy) and `{ type: 'spring', bounce: 0.2, duration: 0.5 }` (playful).
- Use **ease-out** `cubic-bezier(0.23, 1, 0.32, 1)` for things entering or leaving. Never use ease-in on UI.
- **Durations:** 100–160ms for presses, 150–250ms for menus and dropdowns, 300–500ms for pages and modals.
- Animate only `transform`/`opacity`. Respect `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` is already set).
- Actions people repeat many times (⌘K open, keyboard nav) stay fast or don't animate at all.

## Audit: what exists today

| Area | Today | Gap |
|---|---|---|
| Desktop nav tabs (`Navbar.jsx`) | background color swaps instantly | **no sliding spring pill**. Mobile `BottomTabBar` already uses `layoutId`, desktop does not |
| Route change (`PageTransition.jsx`) | hard cut + scroll to top | no enter/exit transition between pages |
| Blog tag chips (`Blog.jsx`) | ring/color transition | no sliding active pill |
| Projects filter dropdown (`Projects.jsx`) | opens and closes instantly | no scale/fade from the trigger; the list doesn't re-flow when the filter changes |
| Project grid on filter | items pop in and out | no `layout` + `AnimatePresence` reorder |
| Buttons (`.btn`) | CSS scale 0.97 + arrow rotate | no spring press, no magnetic pull on primary CTAs |
| Project cards (`.case`) | CSS hover scale | no pointer-follow tilt/spotlight; card → detail has no shared-element morph |
| Numbers (1,190 commits) | static text | `CountUp.jsx` exists but isn't used on the home page |
| Links in body text | color change only | no animated underline draw |
| Nav on scroll | inset/radius scrub (GSAP) | `useNavDirection` exists: check whether hide-on-scroll-down is wired |
| Copy / form feedback (Contact) | not checked yet | check that submit shows loading → spring success check |
| Theme toggle, Dialog, Toast, ⌘K | spring + AnimatePresence | fine |
| Scroll reveals, progress bar | added in the last change | fine |

## Plan (in priority order)

### Tier 1: biggest feel gain, small diff
1. **Desktop nav sliding pill.** Add a `motion.span layoutId="nav-pill"` behind the active link and a hover pill that follows the pointer (separate `layoutId`). Spring 380/32.
2. **Route transitions.** Wrap `<Outlet>` in `AnimatePresence mode="wait"` keyed by pathname: fade + 8px rise in, fade out in 180ms. Keep the wrapper untransformed after it enters (GSAP pins need that). Fallback: View Transitions API via `document.startViewTransition` if Motion fights the pins.
3. **Spring press on all buttons.** Swap the CSS `:active` scale for a shared `whileTap={{ scale: 0.96 }}` spring on `.btn` and `Button.jsx`. Primary CTAs get a magnetic pull (pointer offset × 0.25, spring back).
4. **Blog chips sliding pill.** Same `layoutId` pattern as the nav.

### Tier 2: content feels alive
5. **Projects filter.** Dropdown scales and fades from its trigger origin (200ms ease-out). Grid uses `layout` + `AnimatePresence popLayout` so cards slide into new positions when the filter changes.
6. **Card → detail shared element.** `layoutId={`cover-${slug}`}` on the project cover in the card and on the detail hero, so the cover morphs on navigation. Depends on step 2.
7. **CountUp on stats.** Use the existing `CountUp.jsx` for "1,190" and the commit counts, triggered in view.
8. **Card hover spotlight + tilt.** Pointer-follow radial highlight plus a small rotateX/rotateY with spring smoothing (`useSpring`). Desktop / fine pointer only.

### Tier 3: polish
9. Animated underline on prose links (`background-size` draw, 250ms ease-out).
10. Contact form: button morphs to spinner, then to a check with a spring, plus a shake on validation error.
11. Copy-email button: the icon swaps to a check with `AnimatePresence`, and a toast appears.
12. Hide the nav on scroll down and show it on scroll up (wire `useNavDirection`), with spring y.
13. Back-to-top button that appears after one viewport and shows scroll progress as a ring.

## Verification per step
- Playwright run: press, hover and navigate. Assert nothing is left at opacity 0, and nothing jumps in layout (CLS).
- Emulate reduced motion and confirm the animations are gone and everything still works.
- `npm test` passes.

## Sources
- Emil Kowalski, *Great animations*: https://emilkowal.ski/ui/great-animations
- Emil Kowalski animation standards: https://raw.githubusercontent.com/emilkowalski/skills/main/skills/review-animations/STANDARDS.md
- Motion layout / exits vs CSS: https://uithings.com/framer-motion
- Motion React 2026 guide: https://dev.to/stacknotice/framer-motion-motion-react-animations-complete-guide-2026-3e7l

## Status (2026-11-21)
Shipped: 1–5, 7–13. Spring tokens `--spring` / `--spring-dur` (CSS `linear()`) are in `styles/world.css`, and the magnetic pull is in `lib/magnetic.js`.
Not shipped: **6 (card → detail shared element)**. The route change scrolls to the top, so a Motion `layoutId` morph would fly in from off screen. To do it properly, move to `createBrowserRouter` and use the View Transitions API (`<Link viewTransition>`).
Correction to the audit: the Projects dropdown already animated. It now uses a spring instead.
