import { supabase } from '../../../lib/supabaseClient.js';

const BUCKET = 'blog-images';

// DB row (snake_case, flat) -> frontend shape (camelCase, nested cover).
export function toPost(row) {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    tags: row.tags ?? [],
    coverImage: { url: row.cover_image_url ?? '' },
    published: Boolean(row.published),
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at ?? null
  };
}

// Frontend form values -> DB columns. `cover` is an uploaded-asset result or null.
export function toRow(values, cover) {
  const row = {
    title: values.title,
    excerpt: values.excerpt ?? '',
    content: values.content ?? '',
    tags: values.tags ?? [],
    published: Boolean(values.published)
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

// Newest-published first; drafts (null published_at) sink to the bottom. Admin
// sees drafts too (RLS allows is_admin() to read unpublished rows).
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toPost);
}

export async function fetchPost(slug) {
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
  if (error) throw error;
  return toPost(data);
}

export async function createPost({ values, file }) {
  const cover = file ? await uploadCover(file) : null;
  const row = toRow(values, cover);
  const { data, error } = await supabase.from('posts').insert(row).select().single();
  if (error) throw error;
  return toPost(data);
}

export async function updatePost({ id, values, file }) {
  const cover = file ? await uploadCover(file) : null;
  const row = toRow(values, cover);
  const { data, error } = await supabase.from('posts').update(row).eq('id', id).select().single();
  if (error) throw error;
  return toPost(data);
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
  return { _id: id };
}
