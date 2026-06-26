import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectDetail from '../../src/pages/public/ProjectDetail.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProject: vi.fn().mockResolvedValue({
    _id: '1', title: 'T', slug: 'test', description: 'd', content: '', tags: [],
    coverImage: { url: 'https://cdn/c.jpg' }, liveUrl: '', repoUrl: '', featured: false,
    video: { url: 'https://cdn/v.mp4' }, screenshots: []
  }),
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

describe('ProjectDetail — demo video', () => {
  it('renders the video as a play button in the media gallery', async () => {
    const { container } = renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument());
    expect(container.querySelector('video')).toBeNull();
  });
});
