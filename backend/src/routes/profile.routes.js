import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { profileSchema } from '../validators/profile.validator.js';

export const profileRouter = Router();

profileRouter.get('/', profileController.get);
profileRouter.put('/', requireAuth, validate(profileSchema), profileController.update);
