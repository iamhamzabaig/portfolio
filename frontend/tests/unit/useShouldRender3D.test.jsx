import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useShouldRender3D } from '../../src/components/three/useShouldRender3D.js';

function mockMatchMedia({ coarse = false, reducedMotion = false } = {}) {
  window.matchMedia = vi.fn((query) => ({
    matches:
      (query === '(pointer: coarse)' && coarse) ||
      (query === '(prefers-reduced-motion: reduce)' && reducedMotion),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

function setViewport(width) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
}

function setDevice({ cores = 8, memory = 8 } = {}) {
  Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: cores });
  Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: memory });
}

describe('useShouldRender3D', () => {
  beforeEach(() => {
    setViewport(1280);
    setDevice();
    mockMatchMedia();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and animates on capable desktop devices', () => {
    const { result } = renderHook(() => useShouldRender3D());

    expect(result.current).toEqual({ render: true, animate: true });
  });

  it('does not render when WebGL is unavailable', () => {
    HTMLCanvasElement.prototype.getContext.mockReturnValue(null);

    const { result } = renderHook(() => useShouldRender3D());

    expect(result.current.render).toBe(false);
  });

  it('does not render on coarse pointer, small viewport, or low-end devices', () => {
    mockMatchMedia({ coarse: true });
    expect(renderHook(() => useShouldRender3D()).result.current.render).toBe(false);

    mockMatchMedia();
    setViewport(767);
    expect(renderHook(() => useShouldRender3D()).result.current.render).toBe(false);

    setViewport(1280);
    setDevice({ cores: 4, memory: 8 });
    expect(renderHook(() => useShouldRender3D()).result.current.render).toBe(false);

    setDevice({ cores: 8, memory: 4 });
    expect(renderHook(() => useShouldRender3D()).result.current.render).toBe(false);
  });

  it('keeps rendering but freezes animation for reduced motion', () => {
    mockMatchMedia({ reducedMotion: true });

    const { result } = renderHook(() => useShouldRender3D());

    expect(result.current).toEqual({ render: true, animate: false });
  });
});
