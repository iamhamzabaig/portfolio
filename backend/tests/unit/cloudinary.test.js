import { describe, it, expect, vi } from 'vitest';
import { destroyImage, cloudinary } from '../../src/config/cloudinary.js';
import { uploadCover } from '../../src/middlewares/upload.middleware.js';

describe('cloudinary config', () => {
  it('destroyImage resolves without calling SDK when publicId is empty', async () => {
    const spy = vi.spyOn(cloudinary.uploader, 'destroy');
    await destroyImage('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('destroyImage calls SDK destroy with a publicId', async () => {
    const spy = vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' });
    await destroyImage('portfolio/projects/abc');
    expect(spy).toHaveBeenCalledWith('portfolio/projects/abc');
  });

  it('uploadCover is middleware (a function)', () => {
    expect(typeof uploadCover).toBe('function');
  });
});
