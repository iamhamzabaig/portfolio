import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectDetail from '../../src/pages/public/ProjectDetail.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProject: vi.fn().mockResolvedValue({
    _id: '1', title: 'T', slug: 'test', description: 'd', content: '', tags: [],
    coverImage: { url: 'https://cdn/c.jpg' }, liveUrl: '', repoUrl: '', featured: false,
    video: { url: 'https://cdn/v.mp4' }
  }),
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

describe('ProjectDetail — demo video', () => {
  it('renders a lazy video player when the project has a video', async () => {
    const { container } = renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );

    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn/v.mp4');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('poster', 'https://cdn/c.jpg');
  });
});
