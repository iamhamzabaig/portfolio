import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from '../../src/features/projects/components/VideoPlayer.jsx';

describe('VideoPlayer', () => {
  it('shows a Play button and no video before clicking', () => {
    const { container } = render(<VideoPlayer src="https://cdn/v.mp4" poster="https://cdn/c.jpg" />);
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
  });

  it('mounts an autoplay video with the src after clicking Play', async () => {
    const user = userEvent.setup();
    const onPlayingChange = vi.fn();
    const { container } = render(<VideoPlayer src="https://cdn/v.mp4" poster="https://cdn/c.jpg" onPlayingChange={onPlayingChange} />);
    await user.click(screen.getByRole('button', { name: /play video/i }));
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://cdn/v.mp4');
    expect(video.autoplay).toBe(true);
    expect(onPlayingChange).toHaveBeenCalledWith(true);
  });
});
