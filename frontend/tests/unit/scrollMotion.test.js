import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScrollMotion } from '../../src/lib/scrollMotion.js';

let dispose;
let root;
function fixture(reduced = false) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === 'all' || (reduced && query.includes('prefers-reduced-motion')),
    media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
  }));
  root = document.createElement('div');
  document.body.append(root);
  return root;
}
function card() {
  const element = document.createElement('div');
  element.dataset.scene = 'statement';
  element.innerHTML = '<div class="statement-stage"><span data-statement-ink>Systems</span></div>';

  element.getBoundingClientRect = () => ({ top: 900, bottom: 1100, left: 0, right: 300, width: 300, height: 200 });
  return element;
}
afterEach(() => {
  dispose?.();
  root?.remove();
  vi.restoreAllMocks();
});

describe('scroll motion lifecycle', () => {
  it('restores authored styles and removes its triggers on unmount', () => {
    const root = fixture();
    const element = card();
    root.append(element);
    const before = ScrollTrigger.getAll().length;
    dispose = createScrollMotion(root);
    expect(ScrollTrigger.getAll().length).toBeGreaterThan(before);
    dispose();
    expect(ScrollTrigger.getAll()).toHaveLength(before);
    expect(element.style.opacity).toBe('');
    expect(element.style.transform).toBe('');
  });

  it('owns late-loaded scenes and releases removed scenes without replaying siblings', async () => {
    const root = fixture();
    const first = card();
    root.append(first);
    dispose = createScrollMotion(root);
    const initial = ScrollTrigger.getAll();
    const second = card();
    root.append(second);
    await Promise.resolve();
    expect(ScrollTrigger.getAll()).toHaveLength(initial.length + 1);
    expect(ScrollTrigger.getAll()).toEqual(expect.arrayContaining(initial));
    second.remove();
    await Promise.resolve();
    expect(ScrollTrigger.getAll()).toEqual(initial);
    expect(second.style.opacity).toBe('');
  });

  it('leaves content static with no triggers for reduced motion', () => {
    const root = fixture(true);
    const element = card();
    root.append(element);
    const before = ScrollTrigger.getAll().length;
    dispose = createScrollMotion(root);
    expect(ScrollTrigger.getAll()).toHaveLength(before);
    expect(element.getAttribute('style')).toBeNull();
  });
});
