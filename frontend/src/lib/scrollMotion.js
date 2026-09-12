import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Each scene owns its pin, transforms and accessibility state. No wheel/touch interception.
export function createScrollMotion(root) {
  const media = gsap.matchMedia();
  media.add({ wide: '(min-width: 768px) and (min-height: 620px)',
    reduce: '(prefers-reduced-motion: reduce)', all: 'all' }, (mediaContext) => {
    const { conditions } = mediaContext;
    if (conditions.reduce) return;
    const { wide } = conditions;
    const owned = new Map();
    let timer;
    let disposed = false;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!disposed) ScrollTrigger.refresh(); }, 150);
    };
    const mount = (element) => {
      const select = (s) => [...element.querySelectorAll(s)];
      const timeline = (pin, distance) => gsap.timeline({ defaults: { ease: 'none' },
        scrollTrigger: { trigger: pin || element, start: 'top 72px', end: () => `+=${distance()}`,
          pin, pinSpacing: true, scrub: 0.65, invalidateOnRefresh: true, anticipatePin: 1 } });
      if (element.dataset.scene === 'hero') {
        const stage = element.querySelector('.hero-stage');
        const visual = element.querySelector('[data-hero-visual]');
        if (!visual) return;
        if (!wide) {
          gsap.fromTo(visual, { clipPath: 'inset(0 5% round 16px)' }, {
            clipPath: 'inset(0 0% round 0px)', ease: 'none', scrollTrigger: {
              trigger: visual, start: 'top 80%', end: 'center 40%', scrub: 0.4 } });
          return;
        }
        element.classList.add('scene-enhanced');
        const tl = timeline(stage, () => innerHeight * 1.7);
        tl.to(element.querySelector('h1'), { yPercent: -35, scale: 0.9, duration: 1 }, 0)
          .to(element.querySelector('[data-hero-content]'), { y: () => -innerHeight * 0.4, duration: 1.5 }, 0)
          .fromTo(visual, { borderRadius: 16, scale: 0.52, y: 0, transformOrigin: 'center top' }, {
            y: () => -visual.offsetTop + 28,
            borderRadius: 0, scale: () => stage.clientWidth / visual.clientWidth,
            transformOrigin: 'center top', duration: 1.5 }, 0.15)
          .fromTo(select('[data-depth="back"]'), { rotation: -12, scale: 0.8 }, { rotation: 18, scale: 1.25, duration: 2 }, 0)
          .fromTo(select('[data-depth="mid"]'), { rotationX: 20, z: -70 }, { rotationX: 0, z: 0, duration: 1.6 }, 0.1)
          .to(select('[data-depth="front"]'), { y: -12, duration: 1.6 }, 0.1);
        return () => element.classList.remove('scene-enhanced');
      }
      if (element.dataset.scene === 'statement') {
        const stage = element.querySelector('.statement-stage');
        const tl = timeline(stage, () => innerHeight * (wide ? 1.05 : 0.65));
        select('[data-statement-ink]').forEach((line, i) => {
          tl.fromTo(line, { clipPath: 'inset(0 100% 0 0)', x: 18 }, {
            clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1 }, i * 0.85);
        });
        tl.to({}, { duration: 0.25 });
      }
      if (element.dataset.scene === 'projects' && wide) {
        const cards = select('[data-project]');
        if (cards.length < 2) return;
        element.classList.add('scene-enhanced');
        gsap.set(cards.slice(1), { yPercent: 110, rotationX: 8, z: -100 });
        let active = -1;
        const tl = timeline(element.querySelector('.project-stage'), () => innerHeight * cards.length * 1.15);
        const activate = () => {
          const time = tl.time();
          const next = Math.min(cards.length - 1, Math.max(0, Math.floor(time / 1.5)));
          if (next === active) return;
          active = next;
          cards.forEach((card, i) => { card.inert = i !== active; card.setAttribute('aria-hidden', String(i !== active)); });
        };
        cards.forEach((card, i) => {
          if (i) {
            tl.to(cards[i - 1], { scale: 0.86, rotationY: -5, z: -140, duration: 0.8 }, i * 1.5 - 0.8)
              .to(card, { yPercent: 0, rotationX: 0, z: 0, duration: 0.8 }, i * 1.5 - 0.8);
          }
          tl.fromTo(card.querySelector('[data-project-art]'), { clipPath: 'inset(5% 5% round 16px)' }, {
            clipPath: 'inset(0% 0% round 0px)', duration: 0.65 }, i * 1.5);
        });
        tl.to({}, { duration: 0.6 });
        tl.fromTo(element.querySelector('[data-project-progress]'), { scaleX: 0 }, { scaleX: 1, duration: tl.duration() }, 0);
        tl.eventCallback('onUpdate', activate);
        activate();
        return () => {
          element.classList.remove('scene-enhanced');
          cards.forEach(card => { card.inert = false; card.removeAttribute('aria-hidden'); });
        };
      }
      if (element.dataset.scene === 'services' && wide) {
        const track = element.querySelector('[data-services-track]');
        element.classList.add('scene-enhanced');
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
        const tl = timeline(element, distance);
        tl.to(track, { x: () => -distance(), duration: 1 });
        const focus = (event) => {
          const card = event.target.closest('[data-service-card]');
          if (!card || !tl.scrollTrigger) return;
          const progress = Math.min(1, card.offsetLeft / Math.max(1, distance()));
          window.scrollTo({ top: tl.scrollTrigger.start + progress * (tl.scrollTrigger.end - tl.scrollTrigger.start), behavior: 'instant' });
        };
        element.addEventListener('focusin', focus);
        return () => { element.classList.remove('scene-enhanced'); element.removeEventListener('focusin', focus); };
      }
      if (element.dataset.scene === 'ticker') {
        const track = element.querySelector('[data-ticker-track]');
        const position = { x: 0 };
        const setX = gsap.quickSetter(track, 'x', 'px');
        const move = gsap.quickTo(position, 'x', { duration: 0.45, ease: 'power3.out', onUpdate: () => {
          const width = track.scrollWidth / 2;
          if (width) setX(gsap.utils.wrap(-width, 0, position.x));
        } });
        let lastScroll = window.scrollY;
        let target = 0;
        ScrollTrigger.create({ trigger: root, start: 0, end: 'max', onUpdate: self => {
          const delta = self.scroll() - lastScroll;
          lastScroll = self.scroll();
          // Bounded velocity adds weight without an autoplay loop.
          const velocity = Math.min(Math.abs(self.getVelocity()) / 3000, 0.4);
          target += delta * (0.32 + velocity);
          move(target);
        } });
        return () => { move.tween.kill(); gsap.set(track, { clearProps: 'transform' }); };
      }
    };
    const scan = () => {
      let changed = false;
      owned.forEach((entry, element) => {
        if (!root.contains(element) || entry.key !== element.dataset.sceneKey) {
          entry.context.revert(); owned.delete(element); changed = true;
        }
      });
      root.querySelectorAll('[data-scene]').forEach(element => {
        if (owned.has(element)) return;
        let context;
        // Own each scene once; media cleanup delegates to this registry.
        mediaContext.ignore(() => { context = gsap.context(() => mount(element), element); });
        owned.set(element, { context, key: element.dataset.sceneKey });
        changed = true;
      });
      if (changed) refresh();
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-scene-key'] });
    root.addEventListener('load', refresh, true);
    document.fonts?.ready.then(() => { if (!disposed) refresh(); });
    return () => {
      disposed = true;
      clearTimeout(timer);
      mutations.disconnect();
      root.removeEventListener('load', refresh, true);
      [...owned.values()].reverse().forEach(entry => entry.context.revert());
      owned.clear();
    };
  });
  return () => media.revert();
}

export function createNavMotion(header) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(header, { '--nav-inset': '4%', '--nav-radius': '16px', '--nav-space': '0px', y: 8,
      ease: 'none', scrollTrigger: { start: 0, end: 280, scrub: 0.4 } });
  });
  return () => media.revert();
}
