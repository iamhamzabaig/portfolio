import { z } from 'zod';

const stat = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
  suffix: z.string().optional(),
  description: z.string().optional(),
});

const social = z.object({
  platform: z.string().optional(),
  url: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  stats: z.array(stat).optional(),
  socials: z.array(social).optional(),
});
