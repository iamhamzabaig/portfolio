import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { projectRouter } from './project.routes.js';
import { contactRouter } from './contact.routes.js';
import { profileRouter } from './profile.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/contact', contactRouter);
apiRouter.use('/profile', profileRouter);
