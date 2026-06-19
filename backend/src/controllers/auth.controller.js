import { login as loginService } from '../services/auth.service.js';
import { cookieOptions } from '../utils/cookie.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const { user, token } = await loginService(req.body);
    res.cookie(env.COOKIE_NAME, token, cookieOptions);
    res.status(200).json(new ApiResponse(200, { user }, 'Logged in'));
  }),

  logout: asyncHandler(async (_req, res) => {
    res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(200).json(new ApiResponse(200, null, 'Logged out'));
  }),

  me: asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user));
  }),
};
