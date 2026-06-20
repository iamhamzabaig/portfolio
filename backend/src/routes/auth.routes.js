import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

export const authRouter = Router();

authRouter.post('/login', authLimiter, validate(loginSchema), authController.login);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.me);
