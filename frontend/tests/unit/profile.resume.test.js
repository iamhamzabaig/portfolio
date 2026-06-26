import { describe, expect, it, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/resume-new.pdf' } }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({
    data: { id: 1, name: 'H', resume_url: 'https://cdn/resume-new.pdf', resume_path: 'resume-new.pdf' },
    error: null
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

import { updateProfile } from '../../src/features/profile/api/profile.api.js';

describe('updateProfile — resume upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads the PDF, writes url/path, and deletes the old file', async () => {
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' });
    await updateProfile({ name: 'H', resumeFile: file, currentResumePath: 'resume-old.pdf' });

    expect(m.storageFrom).toHaveBeenCalledWith('project-images');
    expect(m.upload).toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row.resume_url).toBe('https://cdn/resume-new.pdf');
    expect(row.resume_path).toBeTruthy();
    expect(m.remove).toHaveBeenCalledWith(['resume-old.pdf']);
  });

  it('does not upload or delete when no resume file is given', async () => {
    await updateProfile({ name: 'H' });
    expect(m.upload).not.toHaveBeenCalled();
    expect(m.remove).not.toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row).not.toHaveProperty('resume_path');
  });
});
