import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'W', headline: 'Hi there', bio: '', stats: [] }),
  updateProfile: vi.fn()
}));

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
  fetchProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

vi.mock('../../src/features/auth/api/auth.api.js', () => ({
  fetchMe: vi.fn().mockRejectedValue({ response: { status: 401 } }),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn()
}));

const { AuthProvider } = await import('../../src/context/AuthContext.jsx');
const { ThemeProvider } = await import('../../src/context/ThemeContext.jsx');
const { AppRoutes } = await import('../../src/app/router.jsx');

function Tree() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('router', () => {
  it('renders home at /', async () => {
    renderWithProviders(<Tree />, { route: '/' });
    await waitFor(() => expect(screen.getByText('Hi there')).toBeInTheDocument());
  });

  it('renders not found for an unknown route', async () => {
    renderWithProviders(<Tree />, { route: '/nope' });
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('redirects /admin to login when unauthenticated', async () => {
    renderWithProviders(<Tree />, { route: '/admin' });
    await waitFor(() => expect(screen.getByRole('heading', { name: /admin sign in/i })).toBeInTheDocument());
  });
});
