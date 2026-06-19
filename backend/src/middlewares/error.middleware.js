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
