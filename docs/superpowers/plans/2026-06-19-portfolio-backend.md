# Portfolio Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the decoupled Express + Mongoose REST API for the portfolio (Projects CRUD, single-admin JWT auth, Contact messages, editable Profile) with secure Cloudinary image uploads.

**Architecture:** Layered MVC — `route → validate → [auth] → controller → service → model`. `app.js` builds the Express app (no port, importable in tests); `server.js` connects MongoDB and listens. Controllers stay thin; services own all Mongoose queries. JWT is delivered in an httpOnly cookie. Cloudinary uploads are streamed via multer; services store `{ url, publicId }` and destroy the asset on delete.

**Tech Stack:** Node 20+ (ESM), Express 4, Mongoose 8, Zod, jsonwebtoken, bcryptjs, cloudinary + multer + multer-storage-cloudinary, helmet, cors, cookie-parser, express-rate-limit. Tests: Vitest + supertest + mongodb-memory-server.

## Global Constraints

- Module system: **ESM** (`"type": "module"` in package.json). All imports use explicit `.js` extensions.
- Node version floor: **>= 20**.
- API base path: **`/api/v1`** for all routes.
- All write payloads validated with **Zod** via `validate` middleware → HTTP **422** on failure.
- JWT transport: **httpOnly cookie** named by `env.COOKIE_NAME`, options `{ httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax' }`.
- CORS: exact origin from `env.CLIENT_ORIGIN`, `credentials: true`. Never `*` with credentials.
- Passwords: bcryptjs hashed; `password` never serialized in any response.
- Success responses wrapped in `ApiResponse`; errors flow through the central `error.middleware.js`.
- Every task ends green (`npm test`) and is committed.
- Run all commands from the `backend/` directory.

---

### Task 1: Project scaffold & tooling

**Files:**
- Create: `backend/package.json`
- Create: `backend/vitest.config.js`
- Create: `backend/tests/setup.js`
- Create: `backend/.env.example`
- Create: `backend/.gitignore`
- Create: `backend/tests/smoke.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: working `npm test` (Vitest), `mongodb-memory-server` started/stopped per suite, env scaffold.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "portfolio-backend",
  "version": "1.0.0",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "seed:admin": "node src/seed/seedAdmin.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.5.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2",
    "express-rate-limit": "^7.4.1",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.9.0",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "mongodb-memory-server": "^10.1.2",
    "supertest": "^7.0.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `backend/vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    hookTimeout: 60000,
    testTimeout: 30000,
  },
});
```

- [ ] **Step 3: Create `backend/tests/setup.js`**

```js
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
```

- [ ] **Step 4: Create `backend/.env.example`**

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/portfolio
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
COOKIE_NAME=token
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
```

- [ ] **Step 5: Create `backend/.gitignore`**

```
node_modules/
.env
.env.local
coverage/
*.log
```

- [ ] **Step 6: Create the smoke test `backend/tests/smoke.test.js`**

```js
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';

describe('test harness', () => {
  it('connects to in-memory mongo', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
```

- [ ] **Step 7: Install and run**

Run: `npm install && npm test`
Expected: PASS — 1 test passed ("connects to in-memory mongo").

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "chore(backend): scaffold project, tooling, and test harness"
```

---

### Task 2: Config & core utils (env, ApiError, ApiResponse, asyncHandler)

**Files:**
- Create: `backend/src/config/env.js`
- Create: `backend/src/utils/ApiError.js`
- Create: `backend/src/utils/ApiResponse.js`
- Create: `backend/src/utils/asyncHandler.js`
- Test: `backend/tests/unit/utils.test.js`

**Interfaces:**
- Produces:
  - `env` — frozen object: `{ NODE_ENV, PORT, MONGO_URI, CLIENT_ORIGIN, JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD }`. Throws at import if a required var is missing.
  - `class ApiError extends Error { constructor(statusCode, message, details = []) }` with `isOperational = true`.
  - `class ApiResponse { constructor(statusCode, data = null, message = 'Success') }` → `{ success, statusCode, message, data }`.
  - `asyncHandler(fn)` → `(req, res, next) => Promise` that forwards rejections to `next`.

- [ ] **Step 1: Write the failing test `backend/tests/unit/utils.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError.js';
import { ApiResponse } from '../../src/utils/ApiResponse.js';
import { asyncHandler } from '../../src/utils/asyncHandler.js';

describe('ApiError', () => {
  it('sets statusCode, message, details, and isOperational', () => {
    const err = new ApiError(404, 'Not found', ['x']);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.details).toEqual(['x']);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('ApiResponse', () => {
  it('shapes a success envelope', () => {
    const res = new ApiResponse(200, { id: 1 }, 'ok');
    expect(res).toEqual({ success: true, statusCode: 200, message: 'ok', data: { id: 1 } });
  });
});

describe('asyncHandler', () => {
  it('forwards async rejection to next', async () => {
    const boom = new Error('boom');
    const handler = asyncHandler(async () => { throw boom; });
    let passed;
    await handler({}, {}, (e) => { passed = e; });
    expect(passed).toBe(boom);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/utils.test.js`
Expected: FAIL — cannot resolve `../../src/utils/ApiError.js`.

- [ ] **Step 3: Create `backend/src/utils/ApiError.js`**

```js
export class ApiError extends Error {
  constructor(statusCode, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
```

- [ ] **Step 4: Create `backend/src/utils/ApiResponse.js`**

```js
export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
```

- [ ] **Step 5: Create `backend/src/utils/asyncHandler.js`**

```js
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

- [ ] **Step 6: Create `backend/src/config/env.js`**

```js
import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGO_URI',
  'CLIENT_ORIGIN',
  'JWT_SECRET',
  'COOKIE_NAME',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/unit/utils.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 8: Commit**

```bash
git add backend/src/config/env.js backend/src/utils tests/unit/utils.test.js
git commit -m "feat(backend): add env config and core response utils"
```

---

### Task 3: Error/notFound middleware & app skeleton

**Files:**
- Create: `backend/src/middlewares/notFound.middleware.js`
- Create: `backend/src/middlewares/error.middleware.js`
- Create: `backend/src/config/cors.js`
- Create: `backend/src/app.js`
- Test: `backend/tests/integration/app.test.js`

**Interfaces:**
- Consumes: `ApiError`, `ApiResponse`, `env`.
- Produces:
  - `notFound(req, res, next)` → throws `ApiError(404, ...)`.
  - `errorHandler(err, req, res, next)` → JSON `{ success:false, statusCode, message, details }`; maps Mongoose `ValidationError`→422, `CastError`→400, duplicate key (code 11000)→409; unknown→500.
  - `corsOptions` object for the `cors` middleware.
  - `createApp()` → configured Express `app` (helmet, cors, json, cookie-parser, `GET /api/v1/health`, notFound, errorHandler). No `.listen`.

- [ ] **Step 1: Write the failing test `backend/tests/integration/app.test.js`**

```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('app skeleton', () => {
  it('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('unknown route returns 404 envelope', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/app.test.js`
Expected: FAIL — cannot resolve `../../src/app.js`.

- [ ] **Step 3: Create `backend/src/middlewares/notFound.middleware.js`**

```js
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
```

- [ ] **Step 4: Create `backend/src/middlewares/error.middleware.js`**

```js
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || [];

  if (err.name === 'ValidationError') {
    statusCode = 422;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue).join(', ')}`;
  }

  if (statusCode === 500 && !(err instanceof ApiError)) {
    message = env.NODE_ENV === 'production' ? 'Internal Server Error' : message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details,
    ...(env.NODE_ENV !== 'production' && statusCode === 500 ? { stack: err.stack } : {}),
  });
};
```

- [ ] **Step 5: Create `backend/src/config/cors.js`**

```js
import { env } from './env.js';

export const corsOptions = {
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
```

- [ ] **Step 6: Create `backend/src/app.js`**

```js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { ApiResponse } from './utils/ApiResponse.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req, res) => {
    res.status(200).json(new ApiResponse(200, { status: 'ok' }));
  });

  // Feature routers mounted here in later tasks.

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/integration/app.test.js`
Expected: PASS — 2 tests.

- [ ] **Step 8: Commit**

```bash
git add backend/src/app.js backend/src/config/cors.js backend/src/middlewares tests/integration/app.test.js
git commit -m "feat(backend): add app skeleton with cors, helmet, and error handling"
```

---

### Task 4: Database connector

**Files:**
- Create: `backend/src/config/db.js`
- Test: `backend/tests/integration/db.test.js`

**Interfaces:**
- Produces: `connectDB(uri)` → resolves to the mongoose connection; `disconnectDB()` → closes it. `connectDB` sets `mongoose.set('strictQuery', true)`.

- [ ] **Step 1: Write the failing test `backend/tests/integration/db.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/db.test.js`
Expected: FAIL — cannot resolve `../../src/config/db.js`.

- [ ] **Step 3: Create `backend/src/config/db.js`**

```js
import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  mongoose.set('strictQuery', true);
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  await mongoose.connect(uri);
  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/db.test.js`
Expected: PASS — 1 test.

- [ ] **Step 5: Commit**

```bash
git add backend/src/config/db.js tests/integration/db.test.js
git commit -m "feat(backend): add mongoose database connector"
```

---

### Task 5: User model (admin) with bcrypt

**Files:**
- Create: `backend/src/models/user.model.js`
- Test: `backend/tests/unit/user.model.test.js`

**Interfaces:**
- Produces: `User` Mongoose model. Fields: `email` (String, required, unique, lowercase, trimmed), `password` (String, required, `select: false`), `role` (String, enum `['admin']`, default `'admin'`), timestamps. Pre-save hashes `password` with bcryptjs (10 rounds) when modified. Instance method `comparePassword(plain) → Promise<boolean>`. `toJSON` removes `password` and `__v`.

- [ ] **Step 1: Write the failing test `backend/tests/unit/user.model.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/user.model.test.js`
Expected: FAIL — cannot resolve `../../src/models/user.model.js`.

- [ ] **Step 3: Create `backend/src/models/user.model.js`**

```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/user.model.test.js`
Expected: PASS — 2 tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/user.model.js tests/unit/user.model.test.js
git commit -m "feat(backend): add admin User model with bcrypt hashing"
```

---

### Task 6: Token util, auth validator & auth service

**Files:**
- Create: `backend/src/utils/generateToken.js`
- Create: `backend/src/validators/auth.validator.js`
- Create: `backend/src/services/auth.service.js`
- Test: `backend/tests/unit/auth.service.test.js`

**Interfaces:**
- Consumes: `User`, `env`, `ApiError`.
- Produces:
  - `generateToken(userId) → string` (signs `{ sub: userId }`, `expiresIn: env.JWT_EXPIRES_IN`).
  - `verifyToken(token) → { sub }` (throws on invalid).
  - `loginSchema` — Zod object `{ email: string email, password: string min 1 }`.
  - `login({ email, password }) → { user, token }`; throws `ApiError(401, 'Invalid credentials')` when email unknown or password mismatch.

- [ ] **Step 1: Write the failing test `backend/tests/unit/auth.service.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/auth.service.test.js`
Expected: FAIL — cannot resolve `../../src/utils/generateToken.js`.

- [ ] **Step 3: Create `backend/src/utils/generateToken.js`**

```js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);
```

- [ ] **Step 4: Create `backend/src/validators/auth.validator.js`**

```js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});
```

- [ ] **Step 5: Create `backend/src/services/auth.service.js`**

```js
import { User } from '../models/user.model.js';
import { generateToken } from '../utils/generateToken.js';
import { ApiError } from '../utils/ApiError.js';

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = generateToken(user._id);
  user.password = undefined;
  return { user, token };
};
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/auth.service.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 7: Commit**

```bash
git add backend/src/utils/generateToken.js backend/src/validators/auth.validator.js backend/src/services/auth.service.js tests/unit/auth.service.test.js
git commit -m "feat(backend): add JWT util and auth service with login"
```

---

### Task 7: Validate & auth middleware

**Files:**
- Create: `backend/src/middlewares/validate.middleware.js`
- Create: `backend/src/middlewares/auth.middleware.js`
- Test: `backend/tests/unit/middleware.test.js`

**Interfaces:**
- Consumes: `verifyToken`, `User`, `env`, `ApiError`.
- Produces:
  - `validate(schema)` → middleware that parses `req.body` with a Zod schema; on success replaces `req.body` with parsed data + `next()`; on failure `next(new ApiError(422, 'Validation failed', issues))` where `issues` is `[{ path, message }]`.
  - `requireAuth(req, res, next)` → reads `req.cookies[env.COOKIE_NAME]`, verifies, loads `User` by `decoded.sub`, sets `req.user`; throws `ApiError(401, 'Not authenticated')` when missing/invalid.

- [ ] **Step 1: Write the failing test `backend/tests/unit/middleware.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/middleware.test.js`
Expected: FAIL — cannot resolve `../../src/middlewares/validate.middleware.js`.

- [ ] **Step 3: Create `backend/src/middlewares/validate.middleware.js`**

```js
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(new ApiError(422, 'Validation failed', details));
  }
  req.body = result.data;
  next();
};
```

- [ ] **Step 4: Create `backend/src/middlewares/auth.middleware.js`**

```js
import { env } from '../config/env.js';
import { verifyToken } from '../utils/generateToken.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Not authenticated');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, 'Not authenticated');

  req.user = user;
  next();
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/middleware.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 6: Commit**

```bash
git add backend/src/middlewares/validate.middleware.js backend/src/middlewares/auth.middleware.js tests/unit/middleware.test.js
git commit -m "feat(backend): add zod validate and JWT auth middleware"
```

---

### Task 8: Auth controller, routes & cookie wiring

**Files:**
- Create: `backend/src/controllers/auth.controller.js`
- Create: `backend/src/routes/auth.routes.js`
- Create: `backend/src/utils/cookie.js`
- Create: `backend/src/routes/index.js`
- Modify: `backend/src/app.js` (mount router)
- Test: `backend/tests/integration/auth.routes.test.js`

**Interfaces:**
- Consumes: `login`, `loginSchema`, `validate`, `requireAuth`, `env`, `ApiResponse`, `asyncHandler`.
- Produces:
  - `cookieOptions` — `{ httpOnly: true, secure, sameSite, maxAge: 7d }` per Global Constraints.
  - `authController` — `{ login, logout, me }`.
  - `authRouter` mounted at `/api/v1/auth`: `POST /login`, `POST /logout` (auth), `GET /me` (auth).
  - `apiRouter` (in `routes/index.js`) mounted at `/api/v1` in `app.js`.

- [ ] **Step 1: Write the failing test `backend/tests/integration/auth.routes.test.js`**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';

const app = createApp();

beforeEach(async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
});

describe('auth routes', () => {
  it('logs in and sets an httpOnly cookie', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'admin@test.dev', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@test.dev');
    expect(res.body.data.user.password).toBeUndefined();
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/token=/);
    expect(cookie.toLowerCase()).toContain('httponly');
  });

  it('rejects bad login with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'admin@test.dev', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 422 on missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'x' });
    expect(res.status).toBe(422);
  });

  it('GET /me returns current admin when authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
    const res = await agent.get('/api/v1/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.dev');
  });

  it('GET /me returns 401 without cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/auth.routes.test.js`
Expected: FAIL — cannot resolve `../../src/routes/index.js` / route 404s.

- [ ] **Step 3: Create `backend/src/utils/cookie.js`**

```js
import { env } from '../config/env.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
};
```

- [ ] **Step 4: Create `backend/src/controllers/auth.controller.js`**

```js
import { login as loginService } from '../services/auth.service.js';
import { cookieOptions } from '../utils/cookie.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { user, token } = await loginService(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.status(200).json(new ApiResponse(200, { user }, 'Logged in'));
  }),

  logout: asyncHandler(async (_req, res) => {
    res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json(new ApiResponse(200, null, 'Logged out'));
  }),

  me: asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user));
  }),
};
```

- [ ] **Step 5: Create `backend/src/routes/auth.routes.js`**

```js
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.me);
```

- [ ] **Step 6: Create `backend/src/routes/index.js`**

```js
import { Router } from 'express';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
// project/contact/profile routers mounted here in later tasks.
```

- [ ] **Step 7: Mount the router in `backend/src/app.js`**

Replace the comment line `// Feature routers mounted here in later tasks.` with:

```js
  app.use('/api/v1', apiRouter);
```

And add this import near the top with the other imports:

```js
import { apiRouter } from './routes/index.js';
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/integration/auth.routes.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 9: Commit**

```bash
git add backend/src/controllers/auth.controller.js backend/src/routes backend/src/utils/cookie.js backend/src/app.js tests/integration/auth.routes.test.js
git commit -m "feat(backend): add auth controller, routes, and cookie session"
```

---

### Task 9: Project model

**Files:**
- Create: `backend/src/models/project.model.js`
- Test: `backend/tests/unit/project.model.test.js`

**Interfaces:**
- Produces: `Project` model. Fields: `title` (String, required, trim), `slug` (String, unique, lowercase), `description` (String, required), `content` (String, default `''`), `tags` ([String], default `[]`), `coverImage` (`{ url: String, publicId: String }`), `liveUrl` (String), `repoUrl` (String), `featured` (Boolean, default false), `order` (Number, default 0), timestamps. Pre-validate hook derives `slug` from `title` (kebab-case) when slug missing or title modified. `toJSON` removes `__v`.

- [ ] **Step 1: Write the failing test `backend/tests/unit/project.model.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { Project } from '../../src/models/project.model.js';

describe('Project model', () => {
  it('auto-generates a kebab-case slug from title', async () => {
    const p = await Project.create({ title: 'My Cool App!', description: 'd' });
    expect(p.slug).toBe('my-cool-app');
  });

  it('stores coverImage url + publicId', async () => {
    const p = await Project.create({
      title: 'X', description: 'd',
      coverImage: { url: 'http://img', publicId: 'pid' },
    });
    expect(p.coverImage.publicId).toBe('pid');
  });

  it('rejects missing title', async () => {
    await expect(Project.create({ description: 'd' })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/project.model.test.js`
Expected: FAIL — cannot resolve `../../src/models/project.model.js`.

- [ ] **Step 3: Create `backend/src/models/project.model.js`**

```js
import mongoose from 'mongoose';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.pre('validate', function setSlug(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title || '');
  }
  next();
});

projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Project = mongoose.model('Project', projectSchema);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/project.model.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/project.model.js tests/unit/project.model.test.js
git commit -m "feat(backend): add Project model with slug generation"
```

---

### Task 10: Cloudinary config & upload middleware

**Files:**
- Create: `backend/src/config/cloudinary.js`
- Create: `backend/src/middlewares/upload.middleware.js`
- Test: `backend/tests/unit/cloudinary.test.js`

**Interfaces:**
- Consumes: `env`.
- Produces:
  - `cloudinary` — configured v2 SDK instance.
  - `destroyImage(publicId) → Promise` (no-op resolve when `publicId` falsy).
  - `uploadCover` — multer middleware accepting a single field `coverImage`, 5MB limit, image mimetypes only, storing to Cloudinary folder `portfolio/projects`.

NOTE: This task tests the unit pieces (`destroyImage` guard, `uploadCover` is a function). Real Cloudinary network calls are NOT exercised in tests; later route tests mock `uploadCover` and `destroyImage`.

- [ ] **Step 1: Write the failing test `backend/tests/unit/cloudinary.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import { destroyImage, cloudinary } from '../../src/config/cloudinary.js';
import { uploadCover } from '../../src/middlewares/upload.middleware.js';

describe('cloudinary config', () => {
  it('destroyImage resolves without calling SDK when publicId is empty', async () => {
    const spy = vi.spyOn(cloudinary.uploader, 'destroy');
    await destroyImage('');
    expect(spy).not.toHaveBeenCalled();
  });

  it('destroyImage calls SDK destroy with a publicId', async () => {
    const spy = vi.spyOn(cloudinary.uploader, 'destroy').mockResolvedValue({ result: 'ok' });
    await destroyImage('portfolio/projects/abc');
    expect(spy).toHaveBeenCalledWith('portfolio/projects/abc');
  });

  it('uploadCover is middleware (a function)', () => {
    expect(typeof uploadCover).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/cloudinary.test.js`
Expected: FAIL — cannot resolve `../../src/config/cloudinary.js`.

- [ ] **Step 3: Create `backend/src/config/cloudinary.js`**

```js
import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const destroyImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
```

- [ ] **Step 4: Create `backend/src/middlewares/upload.middleware.js`**

```js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit' }],
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new ApiError(400, 'Only image uploads are allowed'));
};

export const uploadCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('coverImage');
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/cloudinary.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 6: Commit**

```bash
git add backend/src/config/cloudinary.js backend/src/middlewares/upload.middleware.js tests/unit/cloudinary.test.js
git commit -m "feat(backend): add cloudinary config and multer upload middleware"
```

---

### Task 11: Project service

**Files:**
- Create: `backend/src/services/project.service.js`
- Test: `backend/tests/unit/project.service.test.js`

**Interfaces:**
- Consumes: `Project`, `destroyImage` (from cloudinary config), `ApiError`.
- Produces:
  - `listProjects({ tag, featured } = {}) → Project[]` sorted by `order` asc then `createdAt` desc.
  - `getProjectBySlug(slug) → Project`; throws `ApiError(404)` if absent.
  - `createProject(data) → Project` (data may include `coverImage`).
  - `updateProject(id, data) → Project`; if `data.coverImage` supplied and an old `publicId` exists, destroys the old asset; throws `ApiError(404)` if absent.
  - `deleteProject(id) → void`; destroys `coverImage.publicId` then removes; throws `ApiError(404)` if absent.

- [ ] **Step 1: Write the failing test `backend/tests/unit/project.service.test.js`**

```js
import { describe, it, expect, vi } from 'vitest';
import * as cloud from '../../src/config/cloudinary.js';
import { Project } from '../../src/models/project.model.js';
import {
  listProjects, getProjectBySlug, createProject, updateProject, deleteProject,
} from '../../src/services/project.service.js';

describe('project.service', () => {
  it('creates and lists projects sorted by order', async () => {
    await createProject({ title: 'B', description: 'd', order: 2 });
    await createProject({ title: 'A', description: 'd', order: 1 });
    const list = await listProjects();
    expect(list.map((p) => p.title)).toEqual(['A', 'B']);
  });

  it('filters by tag and featured', async () => {
    await createProject({ title: 'T', description: 'd', tags: ['react'], featured: true });
    await createProject({ title: 'U', description: 'd', tags: ['node'] });
    expect((await listProjects({ tag: 'react' })).length).toBe(1);
    expect((await listProjects({ featured: 'true' })).length).toBe(1);
  });

  it('getProjectBySlug throws 404 when missing', async () => {
    await expect(getProjectBySlug('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('updateProject destroys old image when cover replaced', async () => {
    const spy = vi.spyOn(cloud, 'destroyImage').mockResolvedValue(null);
    const p = await createProject({
      title: 'X', description: 'd', coverImage: { url: 'u', publicId: 'old' },
    });
    await updateProject(p._id, { coverImage: { url: 'u2', publicId: 'new' } });
    expect(spy).toHaveBeenCalledWith('old');
  });

  it('deleteProject removes doc and destroys its image', async () => {
    const spy = vi.spyOn(cloud, 'destroyImage').mockResolvedValue(null);
    const p = await createProject({
      title: 'Y', description: 'd', coverImage: { url: 'u', publicId: 'pid' },
    });
    await deleteProject(p._id);
    expect(spy).toHaveBeenCalledWith('pid');
    expect(await Project.findById(p._id)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/project.service.test.js`
Expected: FAIL — cannot resolve `../../src/services/project.service.js`.

- [ ] **Step 3: Create `backend/src/services/project.service.js`**

```js
import { Project } from '../models/project.model.js';
import { destroyImage } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

export const listProjects = async ({ tag, featured } = {}) => {
  const filter = {};
  if (tag) filter.tags = tag;
  if (featured !== undefined) filter.featured = featured === 'true' || featured === true;
  return Project.find(filter).sort({ order: 1, createdAt: -1 });
};

export const getProjectBySlug = async (slug) => {
  const project = await Project.findOne({ slug });
  if (!project) throw new ApiError(404, 'Project not found');
  return project;
};

export const createProject = async (data) => Project.create(data);

export const updateProject = async (id, data) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  if (data.coverImage?.publicId && project.coverImage?.publicId &&
      data.coverImage.publicId !== project.coverImage.publicId) {
    await destroyImage(project.coverImage.publicId);
  }

  Object.assign(project, data);
  await project.save();
  return project;
};

export const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.coverImage?.publicId) await destroyImage(project.coverImage.publicId);
  await project.deleteOne();
};
```

NOTE: tests spy on `destroyImage` via `import * as cloud`; the service must call the imported binding directly (it does), so the spy intercepts it.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/project.service.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/project.service.js tests/unit/project.service.test.js
git commit -m "feat(backend): add project service with cloudinary cleanup"
```

---

### Task 12: Project validator, controller & routes

**Files:**
- Create: `backend/src/validators/project.validator.js`
- Create: `backend/src/controllers/project.controller.js`
- Create: `backend/src/routes/project.routes.js`
- Modify: `backend/src/routes/index.js` (mount projects)
- Test: `backend/tests/integration/project.routes.test.js`

**Interfaces:**
- Consumes: project service fns, `validate`, `requireAuth`, `uploadCover`, `ApiResponse`, `asyncHandler`.
- Produces:
  - `createProjectSchema` / `updateProjectSchema` (Zod). `tags` accepts array or comma-separated string → normalized to `string[]`.
  - `projectController` — `{ list, getBySlug, create, update, remove }`. `create`/`update` map `req.file` → `coverImage = { url: req.file.path, publicId: req.file.filename }` when present.
  - `projectRouter` at `/api/v1/projects`: `GET /`, `GET /:slug`, `POST /` (auth, upload, validate), `PUT /:id` (auth, upload, validate), `DELETE /:id` (auth).

NOTE on middleware order: `uploadCover` runs BEFORE `validate` because multer parses multipart form fields into `req.body`. Validation schemas therefore treat all fields as strings.

- [ ] **Step 1: Write the failing test `backend/tests/integration/project.routes.test.js`**

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock upload + cloudinary BEFORE importing the app.
vi.mock('../../src/middlewares/upload.middleware.js', () => ({
  uploadCover: (req, _res, next) => {
    req.file = { path: 'http://cdn/test.jpg', filename: 'portfolio/projects/test' };
    next();
  },
}));
vi.mock('../../src/config/cloudinary.js', () => ({
  cloudinary: { uploader: { destroy: vi.fn() } },
  destroyImage: vi.fn().mockResolvedValue(null),
}));

const { createApp } = await import('../../src/app.js');
const { User } = await import('../../src/models/user.model.js');
const { Project } = await import('../../src/models/project.model.js');

const app = createApp();

const loginAgent = async () => {
  await User.create({ email: 'admin@test.dev', password: 'secret123' });
  const agent = (await import('supertest')).default.agent(app);
  await agent.post('/api/v1/auth/login').send({ email: 'admin@test.dev', password: 'secret123' });
  return agent;
};

describe('project routes', () => {
  it('public can list projects', async () => {
    await Project.create({ title: 'P', description: 'd' });
    const res = await (await import('supertest')).default(app).get('/api/v1/projects');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('public cannot create (401)', async () => {
    const res = await (await import('supertest')).default(app)
      .post('/api/v1/projects').field('title', 'X').field('description', 'd');
    expect(res.status).toBe(401);
  });

  it('admin creates a project with cover image', async () => {
    const agent = await loginAgent();
    const res = await agent.post('/api/v1/projects')
      .field('title', 'New Project').field('description', 'desc').field('tags', 'react,node');
    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('new-project');
    expect(res.body.data.coverImage.publicId).toBe('portfolio/projects/test');
    expect(res.body.data.tags).toEqual(['react', 'node']);
  });

  it('admin deletes a project', async () => {
    const agent = await loginAgent();
    const p = await Project.create({ title: 'Z', description: 'd' });
    const res = await agent.delete(`/api/v1/projects/${p._id}`);
    expect(res.status).toBe(200);
    expect(await Project.findById(p._id)).toBeNull();
  });

  it('returns 422 when title missing on create', async () => {
    const agent = await loginAgent();
    const res = await agent.post('/api/v1/projects').field('description', 'd');
    expect(res.status).toBe(422);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/project.routes.test.js`
Expected: FAIL — cannot resolve `../../src/validators/project.validator.js` / routes 404.

- [ ] **Step 3: Create `backend/src/validators/project.validator.js`**

```js
import { z } from 'zod';

const tags = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(',').map((t) => t.trim()).filter(Boolean);
  });

const base = {
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().optional(),
  tags,
  liveUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  featured: z.union([z.boolean(), z.string()]).optional()
    .transform((v) => v === true || v === 'true'),
  order: z.coerce.number().optional(),
};

export const createProjectSchema = z.object(base);
export const updateProjectSchema = z.object({
  ...base,
  title: base.title.optional(),
  description: base.description.optional(),
});
```

- [ ] **Step 4: Create `backend/src/controllers/project.controller.js`**

```js
import {
  listProjects, getProjectBySlug, createProject, updateProject, deleteProject,
} from '../services/project.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const coverFromFile = (file) =>
  file ? { coverImage: { url: file.path, publicId: file.filename } } : {};

export const projectController = {
  list: asyncHandler(async (req, res) => {
    const data = await listProjects(req.query);
    res.status(200).json(new ApiResponse(200, data));
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const data = await getProjectBySlug(req.params.slug);
    res.status(200).json(new ApiResponse(200, data));
  }),

  create: asyncHandler(async (req, res) => {
    const data = await createProject({ ...req.body, ...coverFromFile(req.file) });
    res.status(201).json(new ApiResponse(201, data, 'Project created'));
  }),

  update: asyncHandler(async (req, res) => {
    const data = await updateProject(req.params.id, { ...req.body, ...coverFromFile(req.file) });
    res.status(200).json(new ApiResponse(200, data, 'Project updated'));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteProject(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Project deleted'));
  }),
};
```

- [ ] **Step 5: Create `backend/src/routes/project.routes.js`**

```js
import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadCover } from '../middlewares/upload.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

export const projectRouter = Router();

projectRouter.get('/', projectController.list);
projectRouter.get('/:slug', projectController.getBySlug);
projectRouter.post('/', requireAuth, uploadCover, validate(createProjectSchema), projectController.create);
projectRouter.put('/:id', requireAuth, uploadCover, validate(updateProjectSchema), projectController.update);
projectRouter.delete('/:id', requireAuth, projectController.remove);
```

- [ ] **Step 6: Mount in `backend/src/routes/index.js`**

Add import and mount (place mount after the auth mount):

```js
import { projectRouter } from './project.routes.js';
```
```js
apiRouter.use('/projects', projectRouter);
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/integration/project.routes.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 8: Commit**

```bash
git add backend/src/validators/project.validator.js backend/src/controllers/project.controller.js backend/src/routes/project.routes.js backend/src/routes/index.js tests/integration/project.routes.test.js
git commit -m "feat(backend): add project CRUD routes with upload + validation"
```

---

### Task 13: Contact feature (model, service, validator, controller, routes, rate limit)

**Files:**
- Create: `backend/src/models/contactMessage.model.js`
- Create: `backend/src/services/contact.service.js`
- Create: `backend/src/validators/contact.validator.js`
- Create: `backend/src/middlewares/rateLimit.middleware.js`
- Create: `backend/src/controllers/contact.controller.js`
- Create: `backend/src/routes/contact.routes.js`
- Modify: `backend/src/routes/index.js` (mount contact)
- Modify: `backend/src/routes/auth.routes.js` (apply `authLimiter` to login)
- Test: `backend/tests/integration/contact.routes.test.js`

**Interfaces:**
- Produces:
  - `ContactMessage` model: `name`, `email`, `message` (all required), `read` (Boolean default false), timestamps.
  - `createMessage(data)`, `listMessages()` (newest first), `deleteMessage(id)` (throws `ApiError(404)` if absent).
  - `contactSchema` (Zod): `name` min 2, `email` email, `message` min 10.
  - `authLimiter` (10 req / 15 min), `contactLimiter` (5 req / 15 min) from `express-rate-limit`.
  - `contactRouter` at `/api/v1/contact`: `POST /` (contactLimiter, validate), `GET /` (auth), `DELETE /:id` (auth).

- [ ] **Step 1: Write the failing test `backend/tests/integration/contact.routes.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/contact.routes.test.js`
Expected: FAIL — cannot resolve `../../src/models/contactMessage.model.js`.

- [ ] **Step 3: Create `backend/src/models/contactMessage.model.js`**

```js
import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactMessageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
```

- [ ] **Step 4: Create `backend/src/services/contact.service.js`**

```js
import { ContactMessage } from '../models/contactMessage.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createMessage = async (data) => ContactMessage.create(data);

export const listMessages = async () => ContactMessage.find().sort({ createdAt: -1 });

export const deleteMessage = async (id) => {
  const msg = await ContactMessage.findByIdAndDelete(id);
  if (!msg) throw new ApiError(404, 'Message not found');
};
```

- [ ] **Step 5: Create `backend/src/validators/contact.validator.js`**

```js
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
```

- [ ] **Step 6: Create `backend/src/middlewares/rateLimit.middleware.js`**

```js
import rateLimit from 'express-rate-limit';

const FIFTEEN_MIN = 15 * 60 * 1000;

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MIN,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, try again later' },
});

export const contactLimiter = rateLimit({
  windowMs: FIFTEEN_MIN,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages, try again later' },
});
```

- [ ] **Step 7: Create `backend/src/controllers/contact.controller.js`**

```js
import { createMessage, listMessages, deleteMessage } from '../services/contact.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactController = {
  create: asyncHandler(async (req, res) => {
    const data = await createMessage(req.body);
    res.status(201).json(new ApiResponse(201, data, 'Message sent'));
  }),

  list: asyncHandler(async (_req, res) => {
    const data = await listMessages();
    res.status(200).json(new ApiResponse(200, data));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteMessage(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Message deleted'));
  }),
};
```

- [ ] **Step 8: Create `backend/src/routes/contact.routes.js`**

```js
import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { contactLimiter } from '../middlewares/rateLimit.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';

export const contactRouter = Router();

contactRouter.post('/', contactLimiter, validate(contactSchema), contactController.create);
contactRouter.get('/', requireAuth, contactController.list);
contactRouter.delete('/:id', requireAuth, contactController.remove);
```

- [ ] **Step 9: Mount contact + apply auth limiter**

In `backend/src/routes/index.js` add:
```js
import { contactRouter } from './contact.routes.js';
```
```js
apiRouter.use('/contact', contactRouter);
```

In `backend/src/routes/auth.routes.js` add the import and apply `authLimiter` to login:
```js
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
```
Change the login line to:
```js
authRouter.post('/login', authLimiter, validate(loginSchema), authController.login);
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run tests/integration/contact.routes.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 11: Commit**

```bash
git add backend/src/models/contactMessage.model.js backend/src/services/contact.service.js backend/src/validators/contact.validator.js backend/src/middlewares/rateLimit.middleware.js backend/src/controllers/contact.controller.js backend/src/routes/contact.routes.js backend/src/routes/index.js backend/src/routes/auth.routes.js tests/integration/contact.routes.test.js
git commit -m "feat(backend): add contact messages feature with rate limiting"
```

---

### Task 14: Profile feature (singleton model, service, validator, controller, routes)

**Files:**
- Create: `backend/src/models/profile.model.js`
- Create: `backend/src/services/profile.service.js`
- Create: `backend/src/validators/profile.validator.js`
- Create: `backend/src/controllers/profile.controller.js`
- Create: `backend/src/routes/profile.routes.js`
- Modify: `backend/src/routes/index.js` (mount profile)
- Test: `backend/tests/integration/profile.routes.test.js`

**Interfaces:**
- Produces:
  - `Profile` model: `name`, `headline`, `bio` (strings), `avatar` `{ url, publicId }`, `stats` (array `{ label, value, suffix, description }`), `socials` (array `{ platform, url }`), timestamps.
  - `getProfile()` → returns the single profile doc, creating an empty one if none exists (upsert-on-read).
  - `updateProfile(data)` → updates (creates if absent) the singleton; returns it.
  - `profileSchema` (Zod): all fields optional; `stats` array of objects; `socials` array of objects.
  - `profileRouter` at `/api/v1/profile`: `GET /` (public), `PUT /` (auth, validate).

- [ ] **Step 1: Write the failing test `backend/tests/integration/profile.routes.test.js`**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/profile.routes.test.js`
Expected: FAIL — cannot resolve `../../src/models/profile.model.js`.

- [ ] **Step 3: Create `backend/src/models/profile.model.js`**

```js
import mongoose from 'mongoose';

const statSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
    suffix: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  { platform: String, url: String },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    stats: { type: [statSchema], default: [] },
    socials: { type: [socialSchema], default: [] },
  },
  { timestamps: true }
);

profileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Profile = mongoose.model('Profile', profileSchema);
```

- [ ] **Step 4: Create `backend/src/services/profile.service.js`**

```js
import { Profile } from '../models/profile.model.js';

export const getProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) profile = await Profile.create({});
  return profile;
};

export const updateProfile = async (data) => {
  const profile = await getProfile();
  Object.assign(profile, data);
  await profile.save();
  return profile;
};
```

- [ ] **Step 5: Create `backend/src/validators/profile.validator.js`**

```js
import { z } from 'zod';

const stat = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
  suffix: z.string().optional(),
  description: z.string().optional(),
});

const social = z.object({
  platform: z.string().optional(),
  url: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  stats: z.array(stat).optional(),
  socials: z.array(social).optional(),
});
```

- [ ] **Step 6: Create `backend/src/controllers/profile.controller.js`**

```js
import { getProfile, updateProfile } from '../services/profile.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileController = {
  get: asyncHandler(async (_req, res) => {
    const data = await getProfile();
    res.status(200).json(new ApiResponse(200, data));
  }),

  update: asyncHandler(async (req, res) => {
    const data = await updateProfile(req.body);
    res.status(200).json(new ApiResponse(200, data, 'Profile updated'));
  }),
};
```

- [ ] **Step 7: Create `backend/src/routes/profile.routes.js`**

```js
import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { profileSchema } from '../validators/profile.validator.js';

export const profileRouter = Router();

profileRouter.get('/', profileController.get);
profileRouter.put('/', requireAuth, validate(profileSchema), profileController.update);
```

- [ ] **Step 8: Mount in `backend/src/routes/index.js`**

```js
import { profileRouter } from './profile.routes.js';
```
```js
apiRouter.use('/profile', profileRouter);
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run tests/integration/profile.routes.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 10: Commit**

```bash
git add backend/src/models/profile.model.js backend/src/services/profile.service.js backend/src/validators/profile.validator.js backend/src/controllers/profile.controller.js backend/src/routes/profile.routes.js backend/src/routes/index.js tests/integration/profile.routes.test.js
git commit -m "feat(backend): add editable singleton profile feature"
```

---

### Task 15: Server entry, admin seed & README

**Files:**
- Create: `backend/src/server.js`
- Create: `backend/src/seed/seedAdmin.js`
- Create: `backend/README.md`
- Test: full suite green.

**Interfaces:**
- Consumes: `createApp`, `connectDB`, `env`, `User`.
- Produces:
  - `server.js` — connects DB then `app.listen(env.PORT)`; logs startup; on connection failure logs and `process.exit(1)`.
  - `seedAdmin.js` — connects, upserts admin from `env.ADMIN_EMAIL` / `env.ADMIN_PASSWORD` (skips if exists), disconnects.

NOTE: `server.js` and `seedAdmin.js` are process entry points (they call `connectDB` and listen/exit), so they are smoke-verified manually, not unit-tested — wiring is already covered by the integration suite using `createApp`.

- [ ] **Step 1: Create `backend/src/server.js`**

```js
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async () => {
  try {
    await connectDB(env.MONGO_URI);
    const app = createApp();
    app.listen(env.PORT, () => {
      console.log(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
```

- [ ] **Step 2: Create `backend/src/seed/seedAdmin.js`**

```js
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';

const run = async () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }
  await connectDB(env.MONGO_URI);
  const existing = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
  } else {
    await User.create({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    console.log(`Admin created: ${env.ADMIN_EMAIL}`);
  }
  await disconnectDB();
  process.exit(0);
};

run();
```

- [ ] **Step 3: Create `backend/README.md`**

```markdown
# Portfolio Backend API

Express + Mongoose REST API. Projects CRUD, single-admin JWT auth, contact
messages, editable profile, Cloudinary image uploads.

## Setup

1. `cp .env.example .env` and fill in values (Mongo Atlas URI, Cloudinary keys,
   a 32+ char `JWT_SECRET`, `CLIENT_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
2. `npm install`
3. `npm run seed:admin` — create the admin user.
4. `npm run dev` — start on `PORT` (default 5000).

## Scripts

- `npm run dev` — watch-mode server
- `npm start` — production server
- `npm run seed:admin` — create/verify admin
- `npm test` — run the Vitest suite

## API (base `/api/v1`)

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/login` | public |
| POST | `/auth/logout` | admin |
| GET | `/auth/me` | admin |
| GET | `/projects` | public |
| GET | `/projects/:slug` | public |
| POST | `/projects` | admin (multipart `coverImage`) |
| PUT | `/projects/:id` | admin |
| DELETE | `/projects/:id` | admin |
| POST | `/contact` | public (rate-limited) |
| GET | `/contact` | admin |
| DELETE | `/contact/:id` | admin |
| GET | `/profile` | public |
| PUT | `/profile` | admin |

## Deploy (Render)

- Build command: `npm install`
- Start command: `npm start`
- Set all `.env` vars in the Render dashboard. Set `CLIENT_ORIGIN` to the
  deployed frontend URL and `NODE_ENV=production` (enables `Secure; SameSite=None`
  cookies for cross-site auth).
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green (utils, app, db, user model, auth service, middleware, auth routes, project model, cloudinary, project service, project routes, contact routes, profile routes).

- [ ] **Step 5: Manual smoke (optional, requires real .env)**

Run: `npm run dev` then in another shell `curl http://localhost:5000/api/v1/health`
Expected: `{"success":true,"statusCode":200,"message":"Success","data":{"status":"ok"}}`

- [ ] **Step 6: Commit**

```bash
git add backend/src/server.js backend/src/seed/seedAdmin.js backend/README.md
git commit -m "feat(backend): add server entry, admin seed script, and README"
```

---

## Self-Review

**1. Spec coverage** (each spec §4 item → task):
- Layered flow route→validate→auth→controller→service→model — Tasks 7,8,12,13,14 ✔
- app.js/server.js split — Tasks 3,15 ✔
- Project model + fields — Task 9 ✔
- User admin + bcrypt + no-password serialize — Task 5 ✔
- ContactMessage — Task 13 ✔
- Profile singleton + stats — Task 14 ✔
- API surface table (all 14 endpoints) — Tasks 3,8,12,13,14 ✔
- Cloudinary config + upload middleware + destroy-on-delete + publicId stored — Tasks 10,11,12 ✔
- Security: helmet, cors whitelist+credentials, rate-limit on /auth+/contact, cookie-parser, httpOnly cookie, bcrypt, central error handler, zod 422, env fail-fast — Tasks 2,3,7,8,10,13 ✔
- env.js validates + fails fast — Task 2 ✔
- Testing strategy (services unit + routes integration w/ in-memory mongo + stubbed cloudinary) — Tasks 1,11,12 ✔

**2. Placeholder scan:** No TBD/TODO/"add error handling"/"similar to" left. Every code step has full code. ✔

**3. Type consistency:** `ApiResponse(statusCode,data,message)`, `ApiError(statusCode,message,details)`, `asyncHandler`, `requireAuth`, `validate(schema)`, `uploadCover`, `destroyImage(publicId)`, `generateToken/verifyToken`, service fn names (`listProjects/getProjectBySlug/createProject/updateProject/deleteProject`, `createMessage/listMessages/deleteMessage`, `getProfile/updateProfile`), cookie name via `env.COOKIE_NAME` — all referenced consistently across tasks. ✔

**Note:** Task 12 project route tests mock `upload.middleware.js` and `cloudinary.js` via `vi.mock` + dynamic `import()` (hoisting-safe). Task 11 service tests spy on the real `destroyImage` binding. Both patterns are intentional and consistent.
