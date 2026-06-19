import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Provide env vars BEFORE any src module loads config/env.js.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_value_at_least_32_chars_long_xx';
process.env.JWT_EXPIRES_IN = '7d';
process.env.COOKIE_NAME = 'token';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.CLOUDINARY_CLOUD_NAME = 'test';
process.env.CLOUDINARY_API_KEY = 'test';
process.env.CLOUDINARY_API_SECRET = 'test';
process.env.ADMIN_EMAIL = 'admin@test.dev';
process.env.ADMIN_PASSWORD = 'test_password_123';
// Placeholder so env.js (validated at import) does not throw before beforeAll
// assigns the real in-memory URI below.
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/placeholder';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  vi.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
