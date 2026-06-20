import { Profile } from '../models/profile.model.js';

// Atomic upsert-on-read: a single DB op enforces the singleton, so two
// concurrent first-reads can't each create a Profile doc (TOCTOU-safe).
export const getProfile = async () =>
  Profile.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

export const updateProfile = async (data) => {
  const profile = await getProfile();
  Object.assign(profile, data);
  await profile.save();
  return profile;
};
