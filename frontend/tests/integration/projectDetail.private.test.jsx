import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectDetail from '../../src/pages/public/ProjectDetail.jsx';
import { fetchProject } from '../../src/features/projects/api/projects.api.js';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProject: vi.fn(),
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

const base = {
  _id: '1', title: 'T', slug: 'test', description: 'd', content: '', tags: [],
  coverImage: { url: 'https://cdn/c.jpg' }, video: { url: '', path: '' }, screenshots: [],
  liveUrl: 'https://live.example', repoUrl: 'https://github.com/x/y'
};

describe('ProjectDetail — private flag', () => {
  it('shows the NDA notice and hides Live/Source when private', async () => {
    fetchProject.mockResolvedValue({ ...base, isPrivate: true });
    renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );
    await waitFor(() => expect(screen.getByText(/under NDA/i)).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /live/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /source/i })).toBeNull();
  });

  it('shows Live/Source when not private', async () => {
    fetchProject.mockResolvedValue({ ...base, isPrivate: false });
    renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );
    await waitFor(() => expect(screen.getByRole('link', { name: /live/i })).toBeInTheDocument());
    expect(screen.queryByText(/under NDA/i)).toBeNull();
  });
});
