import { supabase } from '../../../lib/supabaseClient.js';

const SOCIAL_LABELS = { github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter', x: 'X', website: 'Website' };
const labelFor = (key) => SOCIAL_LABELS[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);

// DB stores socials as a jsonb object {github: url}; the frontend wants an array
// of {platform, url}. Map both ways.
function toProfile(row) {
  return {
    name: row.name ?? '',
    role: row.role ?? '',
    headline: row.headline ?? '',
    bio: row.bio ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    location: row.location ?? '',
    avatarUrl: row.avatar_url ?? '',
    resumeUrl: row.resume_url ?? '',
    stats: row.stats ?? [],
    socials: Object.entries(row.socials ?? {})
      .filter(([, url]) => url)
      .map(([key, url]) => ({ platform: labelFor(key), url }))
  };
}

export async function fetchProfile() {
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single();
  if (error) throw error;
  return toProfile(data);
}

export async function updateProfile(payload) {
  const row = {};
  const direct = { name: 'name', role: 'role', headline: 'headline', bio: 'bio', email: 'email', phone: 'phone', location: 'location', stats: 'stats' };
  for (const [key, col] of Object.entries(direct)) {
    if (payload[key] !== undefined) row[col] = payload[key];
  }
  if (payload.avatarUrl !== undefined) row.avatar_url = payload.avatarUrl;
  if (payload.resumeUrl !== undefined) row.resume_url = payload.resumeUrl;
  if (Array.isArray(payload.socials)) {
    row.socials = Object.fromEntries(payload.socials.map((s) => [s.platform.toLowerCase(), s.url]));
  }

  const { data, error } = await supabase.from('profile').update(row).eq('id', 1).select().single();
  if (error) throw error;
  return toProfile(data);
}
