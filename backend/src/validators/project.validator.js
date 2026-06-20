import { z } from 'zod';

const tags = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(',').map((t) => t.trim()).filter(Boolean);
  });

const base = {
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().optional(),
  tags,
  liveUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  featured: z.union([z.boolean(), z.string()]).optional()
    .transform((v) => v === true || v === 'true'),
  order: z.coerce.number().optional(),
};

export const createProjectSchema = z.object(base);
export const updateProjectSchema = z.object({
  ...base,
  title: base.title.optional(),
  description: base.description.optional(),
});
