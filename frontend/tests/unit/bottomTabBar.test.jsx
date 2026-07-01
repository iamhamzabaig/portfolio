import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { BottomTabBar } from '../../src/components/layout/BottomTabBar.jsx';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

describe('BottomTabBar', () => {
  it('renders the four primary tabs', () => {
    renderWithProviders(<BottomTabBar />, { route: '/' });
    ['Home', 'Projects', 'About', 'Contact'].forEach((label) =>
      expect(screen.getByRole('link', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    );
  });

  it('marks the active route', () => {
    renderWithProviders(<BottomTabBar />, { route: '/projects' });
    const active = screen.getByRole('link', { name: /Projects/i });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('is hidden on desktop via md:hidden', () => {
    const { container } = renderWithProviders(<BottomTabBar />, { route: '/' });
    expect(container.querySelector('nav')).toHaveClass('md:hidden');
  });
});
