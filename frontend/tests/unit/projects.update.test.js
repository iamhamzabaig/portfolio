import { describe, expect, it, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/new.mp4' } }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({
    data: { id: '1', title: 'T', slug: 't', description: 'd' }, error: null
  });
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const storageFrom = vi.fn(() => ({ upload, getPublicUrl, remove }));
  return { upload, getPublicUrl, remove, single, select, eq, update, storageFrom };
});

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({ update: m.update })),
    storage: { from: m.storageFrom }
  }
}));

import { updateProject } from '../../src/features/projects/api/projects.api.js';

const VALUES = { title: 'T', description: 'd' };

describe('updateProject — remove / replace', () => {
  beforeEach(() => vi.clearAllMocks());

  it('remove: nulls the columns and deletes the old object', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, removeVideo: true, currentVideoPath: 'old.mp4' });
    const row = m.update.mock.calls[0][0];
    expect(row).toHaveProperty('video_url', null);
    expect(row).toHaveProperty('video_path', null);
    expect(m.remove).toHaveBeenCalledWith(['old.mp4']);
  });

  it('replace: uploads new, writes new url/path, deletes old object', async () => {
    const videoFile = new File(['x'], 'new.mp4', { type: 'video/mp4' });
    await updateProject({ id: '1', values: VALUES, file: null, videoFile, removeVideo: false, currentVideoPath: 'old.mp4' });
    expect(m.upload).toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row).toHaveProperty('video_url', 'https://cdn/new.mp4');
    expect(row.video_path).toBeTruthy();
    expect(m.remove).toHaveBeenCalledWith(['old.mp4']);
  });

  it('no change: leaves video columns absent and does not delete', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, removeVideo: false, currentVideoPath: 'old.mp4' });
    const row = m.update.mock.calls[0][0];
    expect(row).not.toHaveProperty('video_url');
    expect(row).not.toHaveProperty('video_path');
    expect(m.remove).not.toHaveBeenCalled();
  });
});
