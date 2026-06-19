import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

describe('test harness', () => {
  it('connects to in-memory mongo', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
