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
