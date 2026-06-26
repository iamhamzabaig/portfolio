import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

const projectWithVideo = {
  _id: '1', title: 'My Project', description: 'A long enough description.', tags: [],
  coverImage: { url: 'https://cdn/c.jpg' }, liveUrl: '', repoUrl: '', featured: false,
  video: { url: 'https://cdn/v.mp4', path: 'v.mp4' }
};

describe('ProjectForm — remove/replace', () => {
  it('shows a preview + Remove button and emits removeVideo on save', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <ProjectForm project={projectWithVideo} onSubmit={onSubmit} />
    );

    expect(container.querySelector('video')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove video/i }));
    expect(container.querySelector('video')).toBeNull();

    await user.click(screen.getByRole('button', { name: /save project/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ removeVideo: true, currentVideoPath: 'v.mp4' });
  });

  it('a new project shows no preview or Remove button', () => {
    renderWithProviders(<ProjectForm onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /remove video/i })).not.toBeInTheDocument();
  });
});
