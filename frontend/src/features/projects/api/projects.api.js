import { supabase } from '../../../lib/supabaseClient.js';

const BUCKET = 'project-images';
const BUCKET_VIDEO = 'project-videos';

// DB row (snake_case, flat) -> frontend shape (camelCase, nested cover).
export function toProject(row) {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content: row.content ?? '',
    tags: row.tags ?? [],
    coverImage: { url: row.cover_image_url ?? '' },
    video: { url: row.video_url ?? '', path: row.video_path ?? '' },
    liveUrl: row.live_url ?? '',
    repoUrl: row.repo_url ?? '',
    featured: Boolean(row.featured),
    isPrivate: Boolean(row.is_private),
    screenshots: Array.isArray(row.screenshots)
      ? row.screenshots.map((s) => ({ url: s.url ?? '', path: s.path ?? '' }))
      : [],
  };
}

// Frontend form values -> DB columns. `cover`/`video` are uploaded-asset
// results or null.
export function toRow(values, cover, video) {
  const row = {
    title: values.title,
    description: values.description,
    content: values.content ?? '',
    tags: values.tags ?? [],
    live_url: values.liveUrl ?? '',
    repo_url: values.repoUrl ?? '',
    featured: Boolean(values.featured),
    is_private: Boolean(values.isPrivate)
  };
  if (cover) {
    row.cover_image_url = cover.url;
    row.cover_image_path = cover.path;
  }
  if (video) {
    row.video_url = video.url;
    row.video_path = video.path;
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

async function uploadVideo(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'mp4';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_VIDEO).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_VIDEO).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

async function uploadScreenshot(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

async function resolveScreenshots(existingScreenshots, removeScreenshotPaths, screenshotFiles) {
  const removeSet = new Set(removeScreenshotPaths || []);
  const kept = (existingScreenshots || []).filter((s) => !removeSet.has(s.path));
  const uploaded = [];
  for (const f of screenshotFiles || []) {
    uploaded.push(await uploadScreenshot(f));
  }
  return [...kept, ...uploaded];
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

export async function createProject({ values, file, videoFile, screenshotFiles }) {
  const cover = file ? await uploadCover(file) : null;
  const video = videoFile ? await uploadVideo(videoFile) : null;
  const row = toRow(values, cover, video);
  const shots = await resolveScreenshots([], [], screenshotFiles);
  if (shots.length) row.screenshots = shots;
  const { data, error } = await supabase.from('projects').insert(row).select().single();
  if (error) throw error;
  return toProject(data);
}

export async function updateProject({ id, values, file, videoFile, removeVideo, currentVideoPath, screenshotFiles, removeScreenshotPaths, existingScreenshots }) {
  const cover = file ? await uploadCover(file) : null;
  const row = toRow(values, cover, null);
  if (videoFile) {
    const video = await uploadVideo(videoFile);
    row.video_url = video.url;
    row.video_path = video.path;
  } else if (removeVideo) {
    row.video_url = null;
    row.video_path = null;
  }
  const hasScreenshotChange = (screenshotFiles && screenshotFiles.length) || (removeScreenshotPaths && removeScreenshotPaths.length);
  if (hasScreenshotChange) {
    row.screenshots = await resolveScreenshots(existingScreenshots, removeScreenshotPaths, screenshotFiles);
  }
  const { data, error } = await supabase.from('projects').update(row).eq('id', id).select().single();
  if (error) throw error;
  if ((videoFile || removeVideo) && currentVideoPath) {
    await supabase.storage.from(BUCKET_VIDEO).remove([currentVideoPath]).catch(() => {});
  }
  if (removeScreenshotPaths && removeScreenshotPaths.length) {
    await supabase.storage.from(BUCKET).remove(removeScreenshotPaths).catch(() => {});
  }
  return toProject(data);
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return { _id: id };
}
