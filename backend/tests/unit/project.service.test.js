import { describe, it, expect, vi } from 'vitest';
import * as cloud from '../../src/config/cloudinary.js';
import { Project } from '../../src/models/project.model.js';
import {
  listProjects, getProjectBySlug, createProject, updateProject, deleteProject,
} from '../../src/services/project.service.js';

describe('project.service', () => {
  it('creates and lists projects sorted by order', async () => {
    await createProject({ title: 'B', description: 'd', order: 2 });
    await createProject({ title: 'A', description: 'd', order: 1 });
    const list = await listProjects();
    expect(list.map((p) => p.title)).toEqual(['A', 'B']);
  });

  it('filters by tag and featured', async () => {
    await createProject({ title: 'T', description: 'd', tags: ['react'], featured: true });
    await createProject({ title: 'U', description: 'd', tags: ['node'] });
    expect((await listProjects({ tag: 'react' })).length).toBe(1);
    expect((await listProjects({ featured: 'true' })).length).toBe(1);
  });

  it('getProjectBySlug throws 404 when missing', async () => {
    await expect(getProjectBySlug('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('updateProject destroys old image when cover replaced', async () => {
    const spy = vi.spyOn(cloud, 'destroyImage').mockResolvedValue(null);
    const p = await createProject({
      title: 'X', description: 'd', coverImage: { url: 'u', publicId: 'old' },
    });
    await updateProject(p._id, { coverImage: { url: 'u2', publicId: 'new' } });
    expect(spy).toHaveBeenCalledWith('old');
  });

  it('deleteProject removes doc and destroys its image', async () => {
    const spy = vi.spyOn(cloud, 'destroyImage').mockResolvedValue(null);
    const p = await createProject({
      title: 'Y', description: 'd', coverImage: { url: 'u', publicId: 'pid' },
    });
    await deleteProject(p._id);
    expect(spy).toHaveBeenCalledWith('pid');
    expect(await Project.findById(p._id)).toBeNull();
  });
});
