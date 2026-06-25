import { useEffect, useState } from 'react';

const MIN_DESKTOP_WIDTH = 768;
const RESIZE_DEBOUNCE_MS = 150;

function mediaMatches(query) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

function hasWebGL() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;

  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;

  return (typeof cores === 'number' && cores <= 4) || (typeof memory === 'number' && memory <= 4);
}

function getRenderState() {
  if (typeof window === 'undefined') return { render: false, animate: false };

  const isMobile = window.innerWidth < MIN_DESKTOP_WIDTH || mediaMatches('(pointer: coarse)');
  const reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');

  return {
    render: hasWebGL() && !isMobile && !isLowEndDevice(),
    animate: !reducedMotion
  };
}

export function useShouldRender3D() {
  const [state, setState] = useState(getRenderState);

  useEffect(() => {
    let resizeTimer;
    const reducedMotionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const pointerQuery = typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: coarse)') : null;

    const update = () => setState(getRenderState());
    const updateAfterResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(update, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener('resize', updateAfterResize);
    reducedMotionQuery?.addEventListener?.('change', update);
    pointerQuery?.addEventListener?.('change', update);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', updateAfterResize);
      reducedMotionQuery?.removeEventListener?.('change', update);
      pointerQuery?.removeEventListener?.('change', update);
    };
  }, []);

  return state;
}
