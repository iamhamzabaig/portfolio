import { describe, it, expect } from 'vitest';
import { User } from '../../src/models/user.model.js';

describe('User model', () => {
  it('hashes password on save and never returns it in JSON', async () => {
    const user = await User.create({ email: 'A@Test.dev', password: 'secret123' });
    expect(user.email).toBe('a@test.dev'); // lowercased
    expect(user.password).not.toBe('secret123'); // hashed
    expect(JSON.parse(JSON.stringify(user)).password).toBeUndefined();
  });

  it('comparePassword validates the plain text', async () => {
    await User.create({ email: 'b@test.dev', password: 'secret123' });
    const found = await User.findOne({ email: 'b@test.dev' }).select('+password');
    expect(await found.comparePassword('secret123')).toBe(true);
    expect(await found.comparePassword('wrong')).toBe(false);
  });
});
