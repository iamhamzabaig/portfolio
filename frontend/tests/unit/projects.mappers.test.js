import { describe, expect, it, vi } from 'vitest';

// supabaseClient creates a real client at import time; stub it so importing the
// api module under test does not hit the network.
vi.mock('../../src/lib/supabaseClient.js', () => ({ supabase: {} }));

import { toProject, toRow } from '../../src/features/projects/api/projects.api.js';

describe('projects mappers — video', () => {
  it('maps video_url to video.url, defaulting to empty string', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', video_url: 'https://cdn/v.mp4' }).video.url)
      .toBe('https://cdn/v.mp4');
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).video.url).toBe('');
  });

  it('writes video_url/video_path only when a video is provided', () => {
    const values = { title: 'T', description: 'd' };
    expect(toRow(values, null, null).video_url).toBeUndefined();
    const row = toRow(values, null, { url: 'https://cdn/v.mp4', path: 'abc.mp4' });
    expect(row.video_url).toBe('https://cdn/v.mp4');
    expect(row.video_path).toBe('abc.mp4');
  });

  it('maps video_path to video.path, defaulting to empty string', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', video_path: 'abc.mp4' }).video.path)
      .toBe('abc.mp4');
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).video.path).toBe('');
  });
});
