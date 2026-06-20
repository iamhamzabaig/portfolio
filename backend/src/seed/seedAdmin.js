import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';

const run = async () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }
  try {
    await connectDB(env.MONGO_URI);
    const existing = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
    } else {
      await User.create({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
      console.log(`Admin created: ${env.ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    await disconnectDB();
    process.exit(1);
  }
  await disconnectDB();
  process.exit(0);
};

run();
