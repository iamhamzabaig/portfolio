import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn(() => new Promise(() => {})), // never resolves → loading state
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn()
}));
vi.mock('../../src/features/profile/api/profile.api.js', () => ({
  fetchProfile: vi.fn().mockResolvedValue({ headline: 'Dev', stats: [] }),
  updateProfile: vi.fn()
}));

const Home = (await import('../../src/pages/public/Home.jsx')).default;

describe('Home loading state', () => {
  it('shows skeletons while featured projects load', () => {
    const { container } = renderWithProviders(<Home />, { route: '/' });
    expect(container.querySelector('[data-testid="featured-skeleton"]')).toBeInTheDocument();
  });
});
