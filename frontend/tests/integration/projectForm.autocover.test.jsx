import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';
import { captureVideoFrame } from '../../src/features/projects/captureVideoFrame.js';

vi.mock('../../src/features/projects/captureVideoFrame.js', () => ({
  captureVideoFrame: vi.fn()
}));

function videoFile(name = 'demo.mp4') {
  return new File(['x'], name, { type: 'video/mp4' });
}
function imageFile(name = 'cover.png') {
  return new File(['x'], name, { type: 'image/png' });
}

async function fillRequired(user) {
  await user.type(screen.getByLabelText('Title'), 'My Project');
  await user.type(screen.getByLabelText('Description'), 'A long enough description.');
}

describe('ProjectForm — auto cover from video', () => {
  beforeEach(() => {
    captureVideoFrame.mockReset();
  });

  it('derives a cover from the video when no cover image is uploaded', async () => {
    const derived = imageFile('cover-from-video.jpg');
    captureVideoFrame.mockResolvedValue(derived);
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await fillRequired(user);
    await user.upload(screen.getByLabelText(/demo video/i), videoFile());
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(captureVideoFrame).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0][0].file).toBe(derived);
  });

  it('uses the uploaded cover and skips capture when a cover is provided', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await fillRequired(user);
    const cover = imageFile('cover.png');
    await user.upload(screen.getByLabelText(/cover image/i), cover);
    await user.upload(screen.getByLabelText(/demo video/i), videoFile());
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(captureVideoFrame).not.toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0].file).toBe(cover);
  });

  it('does not derive (or clobber) when the project already has a cover', async () => {
    const onSubmit = vi.fn();
    const project = {
      title: 'Existing',
      description: 'Existing project description.',
      coverImage: { url: 'https://cdn.test/cover.png' }
    };
    const { user } = renderWithProviders(<ProjectForm project={project} onSubmit={onSubmit} />);

    await user.upload(screen.getByLabelText(/demo video/i), videoFile());
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(captureVideoFrame).not.toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0].file).toBeNull();
  });

  it('falls back to no cover when capture fails', async () => {
    captureVideoFrame.mockRejectedValue(new Error('decode failed'));
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await fillRequired(user);
    await user.upload(screen.getByLabelText(/demo video/i), videoFile());
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].file).toBeNull();
  });
});
