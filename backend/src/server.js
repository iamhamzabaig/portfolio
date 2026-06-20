import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async () => {
  try {
    await connectDB(env.MONGO_URI);
    const app = createApp();

    // Render (and most PaaS) put the app behind one reverse proxy. Trust a single
    // hop so req.ip is the real client IP — required for correct express-rate-limit
    // keying and to silence its X-Forwarded-For validation warning. Set on the
    // production entry only, NOT in createApp(), so the test app is unaffected.
    app.set('trust proxy', 1);

    app.listen(env.PORT, () => {
      console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
