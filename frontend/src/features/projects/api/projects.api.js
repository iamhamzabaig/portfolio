import { supabase } from '../../../lib/supabaseClient.js';

const BUCKET = 'project-images';

// DB row (snake_case, flat) -> frontend shape (camelCase, nested cover).
function toProject(row) {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content: row.content ?? '',
    tags: row.tags ?? [],
    coverImage: { url: row.cover_image_url ?? '' },
    liveUrl: row.live_url ?? '',
    repoUrl: row.repo_url ?? '',
    featured: Boolean(row.featured)
  };
}

// Frontend form values -> DB columns. `cover` is the uploaded-image result or null.
function toRow(values, cover) {
  const row = {
    title: values.title,
    description: values.description,
    content: values.content ?? '',
    tags: values.tags ?? [],
    live_url: values.liveUrl ?? '',
    repo_url: values.repoUrl ?? '',
    featured: Boolean(values.featured)
  };
  if (cover) {
    row.cover_image_url = cover.url;
    row.cover_image_path = cover.path;
  }
  return row;
}

async function uploadCover(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function fetchProjects(params = {}) {
  let query = supabase
    .from('projects')
    .select('*')
    .order('featured', { ascending: false })
    .order('sort_order', { ascending: true });
  if (params.featured) query = query.eq('featured', true);

  const { data, error } = await query;
  if (error) throw error;
  return data.map(toProject);
}

export async function fetchProject(slug) {
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
  if (error) throw error;
  return toProject(data);
}

export async function createProject({ values, file }) {
  const cover = file ? await uploadCover(file) : null;
  const { data, error } = await supabase.from('projects').insert(toRow(values, cover)).select().single();
  if (error) throw error;
  return toProject(data);
}

export async function updateProject({ id, values, file }) {
  const cover = file ? await uploadCover(file) : null;
  const { data, error } = await supabase.from('projects').update(toRow(values, cover)).eq('id', id).select().single();
  if (error) throw error;
  return toProject(data);
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return { _id: id };
}
