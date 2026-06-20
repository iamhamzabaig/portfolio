import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { projectRouter } from './project.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
// project/contact/profile routers mounted here in later tasks.
