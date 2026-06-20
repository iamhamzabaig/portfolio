import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../src/test/renderWithProviders.jsx';

vi.mock('../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ name: 'Waqar Raza', headline: 'Full-stack developer', bio: '', stats: [] }),
  updateProfile: vi.fn()
}));

vi.mock('../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
  fetchProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

vi.mock('../src/features/auth/api/auth.api.js', () => ({
  fetchMe: vi.fn().mockRejectedValue({ response: { status: 401 } }),
  loginRequest: vi.fn(),
  logoutRequest: vi.fn()
}));

const { AuthProvider } = await import('../src/context/AuthContext.jsx');
const { ThemeProvider } = await import('../src/context/ThemeContext.jsx');
const App = (await import('../src/app/App.jsx')).default;

describe('App', () => {
  it('renders the portfolio home route', async () => {
    renderWithProviders(
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText('Full-stack developer')).toBeInTheDocument());
  });
});
