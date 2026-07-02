import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { Navbar } from '../../src/components/layout/Navbar.jsx';
import { ThemeProvider } from '../../src/context/ThemeContext.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ resumeUrl: 'https://cdn/resume.pdf' }),
  updateProfile: vi.fn()
}));

describe('Navbar', () => {
  it('shows a Resume link and no public Admin link', async () => {
    renderWithProviders(<ThemeProvider><Navbar /></ThemeProvider>);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', 'https://cdn/resume.pdf')
    );
    expect(screen.queryByRole('link', { name: /^admin$/i })).toBeNull();
  });
});
