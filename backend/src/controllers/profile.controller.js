import { getProfile, updateProfile } from '../services/profile.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileController = {
  get: asyncHandler(async (_req, res) => {
    const data = await getProfile();
    res.status(200).json(new ApiResponse(200, data));
  }),

  update: asyncHandler(async (req, res) => {
    const data = await updateProfile(req.body);
    res.status(200).json(new ApiResponse(200, data, 'Profile updated'));
  }),
};
