import { supabase } from '../../../lib/supabaseClient.js';

const SOCIAL_LABELS = { github: 'GitHub', linkedin: 'LinkedIn', twitter: 'Twitter', x: 'X', website: 'Website' };
const labelFor = (key) => SOCIAL_LABELS[key.toLowerCase()] ?? key.charAt(0).toUpperCase() + key.slice(1);

// Résumé PDFs live in the existing public project-images bucket.
const BUCKET = 'project-images';

async function uploadResume(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'pdf';
  const path = `resume-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

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
    resumePath: row.resume_path ?? '',
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

  // New résumé upload replaces the URL + path; the old object is deleted below.
  if (payload.resumeFile) {
    const resume = await uploadResume(payload.resumeFile);
    row.resume_url = resume.url;
    row.resume_path = resume.path;
  }

  const { data, error } = await supabase.from('profile').update(row).eq('id', 1).select().single();
  if (error) throw error;

  // Best-effort delete of the previous résumé so storage doesn't accumulate.
  if (payload.resumeFile && payload.currentResumePath) {
    await supabase.storage.from(BUCKET).remove([payload.currentResumePath]).catch(() => {});
  }
  return toProfile(data);
}
