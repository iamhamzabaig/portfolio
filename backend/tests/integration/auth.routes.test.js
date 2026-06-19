import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';

const app = createApp();

beforeEach(async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
});

describe('auth routes', () => {
  it('logs in and sets an httpOnly cookie', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'admin@test.dev', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@test.dev');
    expect(res.body.data.user.password).toBeUndefined();
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/token=/);
    expect(cookie.toLowerCase()).toContain('httponly');
  });

  it('rejects bad login with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'admin@test.dev', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 422 on missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'x' });
    expect(res.status).toBe(422);
  });

  it('GET /me returns current admin when authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.dev');
  });

  it('GET /me returns 401 without cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
