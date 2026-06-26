import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaGallery } from '../../src/features/projects/components/MediaGallery.jsx';

describe('MediaGallery', () => {
  it('builds slides from video + screenshots with dot controls', async () => {
    const user = userEvent.setup();
    render(
      <MediaGallery
        video={{ url: 'https://cdn/v.mp4' }}
        screenshots={[{ url: 'https://cdn/a.png', path: 'a' }, { url: 'https://cdn/b.png', path: 'b' }]}
        coverImage={{ url: 'https://cdn/c.jpg' }}
        title="T"
      />
    );
    expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(3);
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.queryByRole('button', { name: /play video/i })).toBeNull();
  });

  it('falls back to the cover image when there are no slides', () => {
    const { container } = render(
      <MediaGallery video={{ url: '' }} screenshots={[]} coverImage={{ url: 'https://cdn/c.jpg' }} title="T" />
    );
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /go to slide/i })).toBeNull();
  });

  it('opens a lightbox when a screenshot is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MediaGallery
        video={{ url: '' }}
        screenshots={[{ url: 'https://cdn/a.png', path: 'a' }, { url: 'https://cdn/b.png', path: 'b' }]}
        coverImage={{ url: 'https://cdn/c.jpg' }}
        title="T"
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: /view screenshot/i }));
    expect(screen.getByRole('dialog', { name: /screenshot viewer/i })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
