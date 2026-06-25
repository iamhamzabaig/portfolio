import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectCard } from '../../src/features/projects/components/ProjectCard.jsx';

const base = { slug: 't', title: 'T', description: 'd', tags: [], coverImage: { url: 'https://cdn/c.jpg' } };

const renderCard = (project) =>
  render(<MemoryRouter><ProjectCard project={project} /></MemoryRouter>);

describe('ProjectCard — demo badge', () => {
  it('shows a DEMO badge when the project has a video', () => {
    renderCard({ ...base, video: { url: 'https://cdn/v.mp4' } });
    expect(screen.getByText(/DEMO/)).toBeInTheDocument();
  });

  it('does not show a DEMO badge without a video, and never renders a <video>', () => {
    const { container } = renderCard({ ...base, video: { url: '' } });
    expect(screen.queryByText(/DEMO/)).not.toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
  });
});
