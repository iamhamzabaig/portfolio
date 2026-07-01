import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ThemeProvider } from '../../src/context/ThemeContext.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'HM', headline: 'Dev', stats: [], resumeUrl: null }),
  updateProfile: vi.fn()
}));

const { PublicLayout } = await import('../../src/layouts/PublicLayout.jsx');

describe('PublicLayout shell', () => {
  it('renders the bottom tab bar alongside routed content', () => {
    renderWithProviders(
      <ThemeProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<h1>Home page</h1>} />
          </Route>
        </Routes>
      </ThemeProvider>,
      { route: '/' }
    );
    expect(screen.getByText('Home page')).toBeInTheDocument();
    // Two primary navs exist: desktop header nav + bottom tab bar.
    expect(screen.getAllByRole('navigation', { name: /primary/i }).length).toBeGreaterThanOrEqual(2);
  });
});
