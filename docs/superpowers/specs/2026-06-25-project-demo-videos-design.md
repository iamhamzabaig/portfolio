# Project Demo Videos — Design

**Date:** 2026-06-25
**Status:** Approved (design)

## Problem

The portfolio shows each project with a cover image and an optional live URL. The
live link is not always shareable (NDA, internal-only, or access-gated work). The
owner wants to attach a short **demo/overview video** per project so a project can
be showcased without exposing a live link.

## Decision

Host videos in **Supabase Storage** (already wired for cover images). At portfolio
scale — a handful of short, compressed clips, single admin — Supabase Storage's
free tier is sufficient and avoids new infrastructure. The "don't store video in
Supabase" guidance applies at large scale; it is not a concern here. The stored
public URL is the only coupling, so migration to Cloudflare R2 or a video API
later is a URL swap.

### Free-tier limits (the constraints this design respects)

| Limit | Free tier | Mitigation in design |
|---|---|---|
| Storage total | 1 GB | Short compressed clips (~10–20 MB) |
| Egress / month | 5 GB | Lazy playback (`preload="none"` + poster); no video on grid |
| Max file size | 50 MB/file | Bucket `file_size_limit` + client-side guard |

Egress is the real cost driver, so playback is designed to fetch **zero video
bytes until the user explicitly presses play**.

## Architecture

Mirrors the existing cover-image flow exactly. Video is an optional, nullable
addition — absent video changes nothing about current behavior.

### 1. Data model

New migration adds two nullable columns to `public.projects`:

```sql
alter table public.projects
  add column if not exists video_url  text,
  add column if not exists video_path text;
```

- `video_url` — public URL used for playback.
- `video_path` — storage object path (for future delete/replace).
- Null `video_url` ⇒ no player rendered.

### 2. Storage bucket + RLS

New bucket `project-videos`, created in the same migration:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800,
        array['video/mp4','video/webm'])
on conflict (id) do nothing;
```

- `public = true` — public read via `getPublicUrl`.
- `file_size_limit = 52428800` (50 MB) — server-side cap.
- `allowed_mime_types` — mp4/webm only, server-side.

Storage object policies for the bucket, built on the hardened `is_admin()` gate
(NOT the legacy `to authenticated using (true)` pattern):

- public read where `bucket_id = 'project-videos'`
- insert / update / delete `to authenticated with check/using (bucket_id = 'project-videos' and public.is_admin())`

### 3. Frontend API (`frontend/src/features/projects/api/projects.api.js`)

- Add `const BUCKET_VIDEO = 'project-videos';`
- `uploadVideo(file)` — clone of `uploadCover`, targets `BUCKET_VIDEO`, returns `{ url, path }`.
- `toProject(row)` — add `video: { url: row.video_url ?? '' }`.
- `toRow(values, cover, video)` — when `video` present, set `row.video_url = video.url` and `row.video_path = video.path`.
- `createProject({ values, file, videoFile })` and `updateProject({ id, values, file, videoFile })` — upload `videoFile` (if present) via `uploadVideo`, pass result to `toRow`.

`projects.queries.js` needs no change — mutation hooks pass the argument object
straight through to `createProject`/`updateProject`.

### 4. Admin upload UI (`frontend/src/features/projects/components/ProjectForm.jsx`)

- Add a file input below the cover image input:
  `<input type="file" accept="video/mp4,video/webm" {...register('video')} />`
- Client-side guard before submit: reject file `> 50 MB` or wrong MIME type with
  an inline error message (avoids a guaranteed-fail server round-trip).
- In `submit`, add `videoFile: values.video?.[0] || null` to the payload.

### 5. Public playback

- **`ProjectDetail.jsx`** — when `project.video?.url` is present, render in the
  media slot (replacing the static `<img>`):

  ```jsx
  <video
    controls
    preload="none"
    src={project.video.url}
    poster={project.coverImage?.url || undefined}
    className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
  />
  ```

  `src` is set directly on `<video>` (not a typed `<source>`) so both mp4 and
  webm play without per-format wiring.

  `preload="none"` + `poster` ⇒ no video bytes fetched until play. When no video,
  the existing image / gradient-monogram fallback is unchanged.

- **`ProjectCard.jsx`** (grid) — NO video element. Keep the cover image. When
  `project.video?.url` exists, show a small `▶ DEMO` badge near the FEATURED
  badge. The grid never loads video bytes.

### 6. Validation & limits

- Server-side: bucket `file_size_limit` (50 MB) + `allowed_mime_types`.
- Client-side: size + type guard in `ProjectForm` for a friendly message.
- Compress clips before upload (documented expectation, not enforced).

## Error handling

- Upload failures throw (existing pattern) and surface through the React Query
  mutation error in the admin editor — same as cover-image upload failures today.
- Oversize/wrong-type caught client-side first; if it reaches the server, the
  bucket rejects it and the thrown error surfaces the same way.

## Testing (vitest, mirroring existing tests)

- `toProject` maps `video_url` → `video.url`; missing column ⇒ empty string.
- `toRow` writes `video_url`/`video_path` only when a video is provided.
- `ProjectForm` renders the video input and rejects an oversize file with an
  inline error.

## Out of scope (YAGNI)

- Transcoding / adaptive bitrate streaming.
- Multiple videos per project.
- Auto-generated thumbnails (cover image serves as poster).
- Autoplay-muted hover previews on cards.
- Cloudflare R2 / dedicated video API (URL-swappable later if egress grows).

## Migration / deploy notes

- New DB migration (e.g. `20260625110000_project_videos.sql`) → `supabase db push`.
- No new frontend env vars.
- Frontend deploys via existing Vercel pipeline.
