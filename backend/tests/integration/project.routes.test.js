import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock upload + cloudinary BEFORE importing the app.
// The real uploadCover is multer (.single), which parses multipart text fields
// into req.body. The mock must do the same — supertest .field() sends
// multipart/form-data, which express.json/urlencoded do NOT parse — so it uses
// multer().none() to populate req.body, then injects a fake uploaded file.
vi.mock('../../src/middlewares/upload.middleware.js', async () => {
  const multer = (await import('multer')).default;
  const parseFields = multer().none();
  return {
    uploadCover: (req, res, next) => {
      parseFields(req, res, (err) => {
        if (err) return next(err);
        req.file = { path: 'http://cdn/test.jpg', filename: 'portfolio/projects/test' };
        next();
      });
    },
  };
});
vi.mock('../../src/config/cloudinary.js', () => ({
  cloudinary: { uploader: { destroy: vi.fn() } },
  destroyImage: vi.fn().mockResolvedValue(null),
}));

const { createApp } = await import('../../src/app.js');
const { User } = await import('../../src/models/user.model.js');
const { Project } = await import('../../src/models/project.model.js');

const app = createApp();

const loginAgent = async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
  const agent = (await import('supertest')).default.agent(app);
  await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
  return agent;
};

describe('project routes', () => {
  it('public can list projects', async () => {
    await Project.create({ title: 'P', description: 'd' });
    const res = await (await import('supertest')).default(app).get('/api/v1/projects');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('public cannot create (401)', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/api/v1/projects').field('title', 'X').field('description', 'd');
    expect(res.status).toBe(401);
  });

  it('admin creates a project with cover image', async () => {
    const agent = await loginAgent();
    const res = await agent.post('/api/v1/projects')
      .field('title', 'New Project').field('description', 'desc').field('tags', 'react,node');
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('new-project');
    expect(res.body.data.coverImage.publicId).toBe('portfolio/projects/test');
    expect(res.body.data.tags).toEqual(['react', 'node']);
  });

  it('admin deletes a project', async () => {
    const agent = await loginAgent();
    const p = await Project.create({ title: 'Z', description: 'd' });
    const res = await agent.delete(`/api/v1/projects/${p._id}`);
    expect(res.status).toBe(200);
    expect(await Project.findById(p._id)).toBeNull();
  });

  it('returns 422 when title missing on create', async () => {
    const agent = await loginAgent();
    const res = await agent.post('/api/v1/projects').field('description', 'd');
    expect(res.status).toBe(422);
  });

  it('PUT without featured field preserves existing featured: true', async () => {
    const agent = await loginAgent();
    const p = await Project.create({ title: 'Featured Project', description: 'desc', featured: true });
    const res = await agent.put(`/api/v1/projects/${p._id}`).field('title', 'Renamed');
    expect(res.status).toBe(200);
    const reloaded = await Project.findById(p._id);
    expect(reloaded.featured).toBe(true);
  });
});
