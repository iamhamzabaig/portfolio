import { describe, expect, it, vi, beforeEach } from 'vitest';

const { upload, getPublicUrl, single, select, insert, storageFrom } = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/test.mp4' } }));
  const single = vi.fn().mockResolvedValue({
    data: { id: '1', title: 'T', slug: 't', description: 'd', video_url: 'https://cdn/test.mp4' },
    error: null
  });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const storageFrom = vi.fn(() => ({ upload, getPublicUrl }));
  return { upload, getPublicUrl, single, select, insert, storageFrom };
});

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({ insert })),
    storage: { from: storageFrom }
  }
}));

import { createProject } from '../../src/features/projects/api/projects.api.js';

describe('createProject — video upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads the video to the project-videos bucket and writes video_url', async () => {
    const videoFile = new File(['x'], 'demo.mp4', { type: 'video/mp4' });
    const result = await createProject({ values: { title: 'T', description: 'd' }, file: null, videoFile });

    expect(storageFrom).toHaveBeenCalledWith('project-videos');
    expect(upload).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ video_url: 'https://cdn/test.mp4' }));
    expect(result.video.url).toBe('https://cdn/test.mp4');
  });

  it('skips video upload when no videoFile is given', async () => {
    await createProject({ values: { title: 'T', description: 'd' }, file: null, videoFile: null });
    expect(storageFrom).not.toHaveBeenCalled();
  });
});
