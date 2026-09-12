# Scroll interaction architecture

The homepage uses six authored interactions, preserving the portfolio's content and theme:

1. Hero: pinned typography and an expanding retrieval-system visual. Three visual layers have distinct scroll transforms; the architecture settles as the hero releases.
2. Engineering statement: a pinned, clipped contrast sweep physically reveals "Systems, not scripts." The full text remains available to assistive technology.
3. Selected work: three projects share one pinned viewport. Incoming panels cover receding panels in perspective; each project includes a reading interval and a working detail link. Uploaded covers take precedence over compositions of the actual project titles and tags.
4. Services: vertical scrolling moves the six service cards horizontally, then releases into writing. Translation is measured from the track's actual overflow.
5. Technology ticker: signed scroll displacement and bounded velocity drive a wrapped track. Movement settles when scrolling stops; there is no autoplay timer.
6. Navigation: scroll progress compacts spacing, insets the surface, and rounds its corners.

## Ownership and accessibility

`frontend/src/lib/scrollMotion.js` registers GSAP + ScrollTrigger once. `PageTransition` owns a route-local controller. Each `[data-scene]` has one GSAP context, owned by a registry outside the parent matchMedia context to avoid duplicate reversion. Mutation observation handles added/removed scenes and changed project identities; image loads and font readiness refresh geometry. Pin-generated DOM changes do not trigger repeated refreshes.

`gsap.matchMedia()` enables the full composition at widths >=768px and heights >=620px. Smaller/shorter viewports use a modest unpinned hero mask, a shorter statement pin, stacked projects, and a service grid. Reduced motion removes pins and spatial transforms, restores every project to document flow, and wraps the complete technology list.

Inactive stacked projects are inert and hidden from assistive technology. Cleanup restores their accessibility state. Content is visible by default if the controller does not mount. Native scrolling remains in control; there are no wheel/touch interceptors or smooth-scroll dependencies. Generic data-motion entrance animations are no longer mounted.

## Verification

- `npm.cmd run build`: production/PWA build passes; Vite reports the existing large application chunk warning.
- `npm.cmd test`: 28 files / 66 tests pass. Lifecycle tests cover cleanup, asynchronous insertion/removal, and reduced motion.
- Headless Chrome: 1440x900 desktop, 768x1024 tablet, 390x844 mobile, dark theme, and runtime reduced-motion changes. No runtime exceptions or horizontal document overflow. All three project states and the final service card are reachable. Route navigation removes pins; returning creates exactly four again. Reduced motion leaves zero pins and zero inert projects.
- Mechanical UI detector: no findings.

References: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
