import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { connectDB } from '../../src/config/db.js';

describe('connectDB', () => {
  it('returns a live connection (already connected by setup)', async () => {
    // setup.js already connected; connectDB should be idempotent-safe.
    const conn = await connectDB(process.env.MONGO_URI);
    expect(conn.readyState).toBe(1);
    expect(mongoose.connection.readyState).toBe(1);
  });
});
