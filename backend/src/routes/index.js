import { Router } from 'express';
import { authRouter } from './auth.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
// project/contact/profile routers mounted here in later tasks.
