import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.middleware.js';
import { requireAuth } from '../../src/middlewares/auth.middleware.js';
import { User } from '../../src/models/user.model.js';
import { generateToken } from '../../src/utils/generateToken.js';

const run = (mw, req) =>
  new Promise((resolve) => {
    const res = {};
    mw(req, res, (err) => resolve(err));
  });

describe('validate', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('passes and assigns parsed body', async () => {
    const req = { body: { name: 'ok', extra: 'stripped?' } };
    const err = await run(validate(schema), req);
    expect(err).toBeUndefined();
    expect(req.body.name).toBe('ok');
  });

  it('rejects invalid body with 422', async () => {
    const req = { body: { name: '' } };
    const err = await run(validate(schema), req);
    expect(err.statusCode).toBe(422);
    expect(err.details.length).toBeGreaterThan(0);
  });
});

describe('requireAuth', () => {
  it('sets req.user for a valid cookie', async () => {
    const user = await User.create({ email: 'admin@test.dev', password: 'secret123' });
    const req = { cookies: { token: generateToken(user._id) } };
    const err = await run(requireAuth, req);
    expect(err).toBeUndefined();
    expect(String(req.user._id)).toBe(String(user._id));
  });

  it('rejects when no cookie', async () => {
    const err = await run(requireAuth, { cookies: {} });
    expect(err.statusCode).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const err = await run(requireAuth, { cookies: { token: 'garbage' } });
    expect(err.statusCode).toBe(401);
  });
});
