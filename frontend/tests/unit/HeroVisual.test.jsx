import { render, screen } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HeroVisual from '../../src/components/three/HeroVisual.jsx';
import { StaticGlow } from '../../src/components/three/StaticGlow.jsx';
import { useShouldRender3D } from '../../src/components/three/useShouldRender3D.js';

const sceneRender = vi.hoisted(() => vi.fn());

vi.mock('../../src/components/three/useShouldRender3D.js', () => ({
  useShouldRender3D: vi.fn()
}));

vi.mock('../../src/components/three/HeroScene.jsx', () => ({
  default: (props) => {
    sceneRender(props);
    return <div data-testid="hero-scene" />;
  }
}));

function createPointer() {
  return {
    glowX: motionValue(12),
    glowY: motionValue(-8)
  };
}

describe('StaticGlow', () => {
  it('renders the extracted decorative glow', () => {
    render(<StaticGlow {...createPointer()} />);

    expect(screen.getByTestId('static-glow')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('HeroVisual', () => {
  beforeEach(() => {
    sceneRender.mockClear();
  });

  it('renders StaticGlow when 3D is gated off', () => {
    useShouldRender3D.mockReturnValue({ render: false, animate: true });

    render(<HeroVisual pointer={createPointer()} />);

    expect(screen.getByTestId('static-glow')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-scene')).not.toBeInTheDocument();
    expect(sceneRender).not.toHaveBeenCalled();
  });

  it('lazy-renders HeroScene with pointer and animation state when 3D is allowed', async () => {
    const pointer = createPointer();
    useShouldRender3D.mockReturnValue({ render: true, animate: false });

    render(<HeroVisual pointer={pointer} />);

    expect(await screen.findByTestId('hero-scene')).toBeInTheDocument();
    expect(sceneRender).toHaveBeenCalledWith(expect.objectContaining({ animate: false, pointer }));
  });
});
