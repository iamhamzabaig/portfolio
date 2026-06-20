import { Profile } from '../models/profile.model.js';

export const getProfile = async () => {
  let profile = await Profile.findOne();
  if (!profile) profile = await Profile.create({});
  return profile;
};

export const updateProfile = async (data) => {
  const profile = await getProfile();
  Object.assign(profile, data);
  await profile.save();
  return profile;
};
