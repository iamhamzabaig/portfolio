import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Button } from '@heroui/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('HeroUI foundation', () => {
  it('renders a HeroUI Button inside the provider', () => {
    renderWithProviders(<Button>Press</Button>);
    expect(screen.getByRole('button', { name: 'Press' })).toBeInTheDocument();
  });
});
