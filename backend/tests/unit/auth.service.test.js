import { describe, it, expect } from 'vitest';
import { User } from '../../src/models/user.model.js';
import { login } from '../../src/services/auth.service.js';
import { generateToken, verifyToken } from '../../src/utils/generateToken.js';

describe('generateToken/verifyToken', () => {
  it('round-trips a user id', () => {
    const token = generateToken('abc123');
    expect(verifyToken(token).sub).toBe('abc123');
  });
});

describe('auth.login', () => {
  it('returns user + token for valid credentials', async () => {
    await User.create({ email: 'admin@test.dev', password: 'secret123' });
    const { user, token } = await login({ email: 'admin@test.dev', password: 'secret123' });
    expect(user.email).toBe('admin@test.dev');
    expect(verifyToken(token).sub).toBe(String(user._id));
  });

  it('rejects bad password with 401', async () => {
    await User.create({ email: 'admin@test.dev', password: 'secret123' });
    await expect(login({ email: 'admin@test.dev', password: 'nope' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects unknown email with 401', async () => {
    await expect(login({ email: 'ghost@test.dev', password: 'x' }))
      .rejects.toMatchObject({ statusCode: 401 });
  });
});
