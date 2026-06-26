import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectsAdmin from '../../src/pages/admin/ProjectsAdmin.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    { _id: '1', title: 'With Video', slug: 'with', tags: [], coverImage: { url: '' }, video: { url: 'https://cdn/v.mp4' } },
    { _id: '2', title: 'No Video', slug: 'no', tags: [], coverImage: { url: '' }, video: { url: '' } }
  ]),
  fetchProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

describe('ProjectsAdmin — demo video indicator', () => {
  it('marks only rows that have a demo video', async () => {
    renderWithProviders(<ProjectsAdmin />);
    await waitFor(() => expect(screen.getByText('With Video')).toBeInTheDocument());
    expect(screen.getAllByText('Has demo video')).toHaveLength(1);
  });
});
