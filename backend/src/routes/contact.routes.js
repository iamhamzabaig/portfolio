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
