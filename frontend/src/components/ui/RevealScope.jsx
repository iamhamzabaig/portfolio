import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// GSAP-powered coordinated text reveal. Wrap a header group in <RevealScope>;
// mark each animatable child:
//   data-split — headings/subheads: split into words that rise + fade in a
//                stagger (SplitText), the marquee "type assembles itself" look.
//   data-fade  — supporting bits (eyebrows, links, buttons): rise + fade as one.
// Children animate in DOM order, each group slightly overlapping the last, so an
// eyebrow → headline → subhead cascade reads as one motion.
//
// `immediate` plays on mount (above-the-fold heroes); otherwise a ScrollTrigger
// fires it once as the group enters. Reduced-motion: we skip entirely and leave
// everything in its natural, fully-visible state. `deps` re-runs the split when
// the underlying text changes (e.g. async profile data replacing the fallback),
// so GSAP never fights React reconciliation over stale word spans.

const EASE = 'power3.out';

export function RevealScope({
  as: Tag = 'div',
  immediate = false,
  start = 'top 82%',
  deps = [],
  className = '',
  children,
  ...props
}) {
  const scope = useRef(null);

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return undefined;
    // Skip under jsdom (tests): no layout/scroll exists, so the reveal is a
    // no-op there, and SplitText's word-spans would fragment text that tests
    // and crawlers read as one string. Real browsers get the full effect.
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const nodes = gsap.utils.toArray('[data-split],[data-fade]', el);
      if (!nodes.length) return;

      const tl = gsap.timeline({
        defaults: { ease: EASE, duration: 0.85 },
        scrollTrigger: immediate ? undefined : { trigger: el, start, once: true }
      });

      let at = 0;
      nodes.forEach((node) => {
        if (node.hasAttribute('data-split')) {
          // Split into words; keep the total stagger bounded so long subheads
          // still resolve quickly rather than crawling word-by-word.
          const split = new SplitText(node, { type: 'words', wordsClass: 'gsap-word' });
          gsap.set(split.words, { autoAlpha: 0, yPercent: 60 });
          tl.to(split.words, { autoAlpha: 1, yPercent: 0, stagger: { amount: 0.5 } }, at);
          at += 0.22;
        } else {
          gsap.set(node, { autoAlpha: 0, y: 18 });
          tl.to(node, { autoAlpha: 1, y: 0 }, at);
          at += 0.12;
        }
      });
    }, scope);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, start, ...deps]);

  return (
    <Tag ref={scope} className={className} {...props}>
      {children}
    </Tag>
  );
}
