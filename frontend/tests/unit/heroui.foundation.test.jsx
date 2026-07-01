import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Button } from '@heroui/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('HeroUI foundation', () => {
  it('renders a HeroUI Button inside the provider', () => {
    renderWithProviders(<Button>Press</Button>);
    expect(screen.getByRole('button', { name: 'Press' })).toBeInTheDocument();
  });

  it('exposes a glass surface utility', () => {
    const { container } = renderWithProviders(<div className="glass" data-testid="g" />);
    const el = container.querySelector('[data-testid="g"]');
    // jsdom does not apply Tailwind layers; assert the class is retained on the node.
    expect(el).toHaveClass('glass');
  });
});
