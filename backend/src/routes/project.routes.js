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
