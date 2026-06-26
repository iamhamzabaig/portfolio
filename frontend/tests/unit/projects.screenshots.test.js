import { describe, expect, it, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/shot.png' } }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({
    data: { id: '1', title: 'T', slug: 't', description: 'd', screenshots: [] }, error: null
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

describe('updateProject — screenshots', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads new screenshots and appends them to the kept ones', async () => {
    const file = new File(['x'], 's.png', { type: 'image/png' });
    await updateProject({
      id: '1', values: VALUES, file: null, videoFile: null,
      screenshotFiles: [file], removeScreenshotPaths: [],
      existingScreenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }]
    });
    expect(m.upload).toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row.screenshots).toEqual([
      { url: 'https://cdn/a.png', path: 'a.png' },
      { url: 'https://cdn/shot.png', path: expect.any(String) }
    ]);
  });

  it('removes selected screenshots and deletes their objects', async () => {
    await updateProject({
      id: '1', values: VALUES, file: null, videoFile: null,
      screenshotFiles: [], removeScreenshotPaths: ['a.png'],
      existingScreenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }, { url: 'https://cdn/b.png', path: 'b.png' }]
    });
    const row = m.update.mock.calls[0][0];
    expect(row.screenshots).toEqual([{ url: 'https://cdn/b.png', path: 'b.png' }]);
    expect(m.remove).toHaveBeenCalledWith(['a.png']);
  });

  it('leaves screenshots untouched when there is no screenshot change', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, screenshotFiles: [], removeScreenshotPaths: [] });
    const row = m.update.mock.calls[0][0];
    expect(row).not.toHaveProperty('screenshots');
    expect(m.remove).not.toHaveBeenCalled();
  });
});
