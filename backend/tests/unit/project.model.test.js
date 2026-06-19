import { describe, it, expect } from 'vitest';
import { Project } from '../../src/models/project.model.js';

describe('Project model', () => {
  it('auto-generates a kebab-case slug from title', async () => {
    const p = await Project.create({ title: 'My Cool App!', description: 'd' });
    expect(p.slug).toBe('my-cool-app');
  });

  it('stores coverImage url + publicId', async () => {
    const p = await Project.create({
      title: 'X', description: 'd',
      coverImage: { url: 'http://img', publicId: 'pid' },
    });
    expect(p.coverImage.publicId).toBe('pid');
  });

  it('rejects missing title', async () => {
    await expect(Project.create({ description: 'd' })).rejects.toThrow();
  });
});
