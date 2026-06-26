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
  liveUrl: 'https://live.example', repoUrl: 'https://github.com/x/y',
  isLivePrivate: false, isRepoPrivate: false
};

const renderDetail = () =>
  renderWithProviders(
    <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
    { route: '/projects/test' }
  );

describe('ProjectDetail — per-link NDA flags', () => {
  it('live private: shows the Live NDA pill and keeps the Source button', async () => {
    fetchProject.mockResolvedValue({ ...base, isLivePrivate: true });
    renderDetail();
    await waitFor(() => expect(screen.getByText(/live demo under nda/i)).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /live/i })).toBeNull();
    expect(screen.getByRole('link', { name: /source/i })).toBeInTheDocument();
  });

  it('repo private: shows the Source NDA pill and keeps the Live button', async () => {
    fetchProject.mockResolvedValue({ ...base, isRepoPrivate: true });
    renderDetail();
    await waitFor(() => expect(screen.getByText(/source under nda/i)).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /source/i })).toBeNull();
    expect(screen.getByRole('link', { name: /live/i })).toBeInTheDocument();
  });

  it('neither private: shows both Live and Source buttons, no NDA pill', async () => {
    fetchProject.mockResolvedValue({ ...base });
    renderDetail();
    await waitFor(() => expect(screen.getByRole('link', { name: /live/i })).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /source/i })).toBeInTheDocument();
    expect(screen.queryByText(/under nda/i)).toBeNull();
  });
});
