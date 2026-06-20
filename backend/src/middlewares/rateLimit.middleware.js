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
