import mongoose from 'mongoose';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.pre('validate', function setSlug(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title || '');
  }
  next();
});

projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Project = mongoose.model('Project', projectSchema);
