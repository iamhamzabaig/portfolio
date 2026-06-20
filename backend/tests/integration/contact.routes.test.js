import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';
import { ContactMessage } from '../../src/models/contactMessage.model.js';

const app = createApp();

const adminAgent = async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
  const agent = supertest.agent(app);
  await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
  return agent;
};

describe('contact routes', () => {
  it('public submits a message', async () => {
    const res = await supertest(app).post('/api/v1/contact')
      .send({ name: 'Jane', email: 'jane@x.com', message: 'Hello there, nice site!' });
    expect(res.status).toBe(201);
    expect(await ContactMessage.countDocuments()).toBe(1);
  });

  it('rejects short message with 422', async () => {
    const res = await supertest(app).post('/api/v1/contact')
      .send({ name: 'Jane', email: 'jane@x.com', message: 'hi' });
    expect(res.status).toBe(422);
  });

  it('admin lists and deletes messages', async () => {
    const agent = await adminAgent();
    const m = await ContactMessage.create({ name: 'A', email: 'a@x.com', message: 'long enough msg' });
    const list = await agent.get('/api/v1/contact');
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(1);
    const del = await agent.delete(`/api/v1/contact/${m._id}`);
    expect(del.status).toBe(200);
    expect(await ContactMessage.countDocuments()).toBe(0);
  });

  it('public cannot list messages (401)', async () => {
    const res = await supertest(app).get('/api/v1/contact');
    expect(res.status).toBe(401);
  });
});
