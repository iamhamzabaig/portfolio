import mongoose from 'mongoose';

const statSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
    suffix: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const socialSchema = new mongoose.Schema(
  { platform: String, url: String },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    stats: { type: [statSchema], default: [] },
    socials: { type: [socialSchema], default: [] },
  },
  { timestamps: true }
);

profileSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Profile = mongoose.model('Profile', profileSchema);
