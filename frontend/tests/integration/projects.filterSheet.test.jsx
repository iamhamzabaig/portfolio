import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { id: '1', slug: 'a', title: 'Alpha', summary: 's', tags: ['web'], featured: false, cover: null }
  ]),
  fetchProject: vi.fn(), createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn()
}));

const Projects = (await import('../../src/pages/public/Projects.jsx')).default;

describe('Projects mobile filter sheet', () => {
  it('opens a bottom sheet of filters from the Filters button', async () => {
    const { user } = renderWithProviders(<Projects />, { route: '/projects' });
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: /filters/i }));
    expect(await screen.findByText(/filter projects/i)).toBeInTheDocument();
  });
});
