import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';

const app = createApp();

const adminAgent = async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
  const agent = supertest.agent(app);
  await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
  return agent;
};

describe('profile routes', () => {
  it('GET returns a profile (auto-created) for the public', async () => {
    const res = await supertest(app).get('/api/v1/profile');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeTruthy();
  });

  it('admin updates the profile', async () => {
    const agent = await adminAgent();
    const res = await agent.put('/api/v1/profile').send({
      name: 'Waqar', headline: 'Full-stack dev',
      stats: [{ label: 'Projects', value: '20', suffix: '+', description: 'shipped' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Waqar');
    expect(res.body.data.stats[0].label).toBe('Projects');
  });

  it('public cannot update profile (401)', async () => {
    const res = await supertest(app).put('/api/v1/profile').send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});
