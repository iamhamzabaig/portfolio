import { env } from '../config/env.js';
import { verifyToken } from '../utils/generateToken.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Not authenticated');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, 'Not authenticated');

  req.user = user;
  next();
});
