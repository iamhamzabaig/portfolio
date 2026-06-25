# Project Demo Videos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin attach one optional demo video per project, hosted in Supabase Storage, played on the project detail page without burning egress on page load.

**Architecture:** Mirror the existing cover-image flow. Two nullable columns on `projects` (`video_url`, `video_path`), a public `project-videos` storage bucket gated by `is_admin()`, an `uploadVideo` helper + video fields threaded through the projects API mappers and mutations, a video file input in the admin form, lazy `<video>` playback on the detail page, and a DEMO badge (no video bytes) on grid cards.

**Tech Stack:** React 18, Vite 6, `@supabase/supabase-js` ^2.45, React Query 5, react-hook-form + zod, Tailwind, Vitest + Testing Library, Supabase (Postgres + Storage).

## Global Constraints

- Supabase JS is `^2.45` → uses the **legacy anon JWT** key; do not introduce `sb_publishable_` assumptions.
- Video files: **MP4 or WebM only**, **≤ 50 MB** each. Enforced server-side by the bucket (`file_size_limit = 52428800`, `allowed_mime_types`) and client-side in the form.
- New storage bucket id/name: **`project-videos`**, `public = true`.
- Storage write policies gated on **`public.is_admin()`** (the hardened gate), never `to authenticated using (true)`.
- Playback must use `preload="none"` + a `poster` so **zero video bytes load until the user presses play**. No `<video>` element on the grid.
- Existing behavior with no video must be unchanged (all video fields optional/nullable).
- Never `git add -A` — stage exact paths only (backend/frontend shared-repo split).

---

### Task 1: Database migration — columns, bucket, RLS

**Files:**
- Create: `backend/supabase/migrations/20260625110000_project_videos.sql`

**Interfaces:**
- Produces: `projects.video_url` (text, null), `projects.video_path` (text, null); storage bucket `project-videos`; storage RLS policies for that bucket.

- [ ] **Step 1: Write the migration**

Create `backend/supabase/migrations/20260625110000_project_videos.sql`:

```sql
-- Project demo videos: optional per-project clip hosted in Supabase Storage.
-- Mirrors the cover-image columns + bucket, but writes are gated on is_admin()
-- from the start (not the legacy "any authenticated" pattern).

alter table public.projects
  add column if not exists video_url  text,
  add column if not exists video_path text;

-- Public bucket for project demo videos. 50 MB cap + mp4/webm only, enforced
-- server-side so an oversize/wrong-type upload is rejected even if the client
-- guard is bypassed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 52428800,
        array['video/mp4', 'video/webm'])
on conflict (id) do nothing;

create policy "project-videos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-videos');

create policy "project-videos admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-videos' and public.is_admin());

create policy "project-videos admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-videos' and public.is_admin())
  with check (bucket_id = 'project-videos' and public.is_admin());

create policy "project-videos admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-videos' and public.is_admin());
```

- [ ] **Step 2: Apply to the database**

Run (hosted): `cd backend && npx supabase db push`
Expected: output lists `20260625110000_project_videos.sql` as applied, no errors.

(Local alternative if Docker is running: `cd backend && npx supabase db reset` — re-applies all migrations + seed.)

- [ ] **Step 3: Verify columns + bucket exist**

In the Supabase SQL editor (or `psql`), run:
```sql
select column_name from information_schema.columns
  where table_schema = 'public' and table_name = 'projects'
    and column_name in ('video_url', 'video_path');
select id, file_size_limit, allowed_mime_types from storage.buckets
  where id = 'project-videos';
```
Expected: both columns returned; one bucket row with `file_size_limit = 52428800` and mime types `{video/mp4,video/webm}`.

- [ ] **Step 4: Commit**

```bash
git add backend/supabase/migrations/20260625110000_project_videos.sql
git commit -m "feat(db): add project video columns, bucket, and admin RLS"
```

---

### Task 2: API mappers — expose and extend `toProject` / `toRow`

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Test: `frontend/tests/unit/projects.mappers.test.js`

**Interfaces:**
- Produces (now exported): `toProject(row)` → adds `video: { url: string }`; `toRow(values, cover, video)` → writes `video_url`/`video_path` when `video` is truthy.
- Consumes: nothing new.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/projects.mappers.test.js`:

```js
import { describe, expect, it, vi } from 'vitest';

// supabaseClient creates a real client at import time; stub it so importing the
// api module under test does not hit the network.
vi.mock('../../src/lib/supabaseClient.js', () => ({ supabase: {} }));

import { toProject, toRow } from '../../src/features/projects/api/projects.api.js';

describe('projects mappers — video', () => {
  it('maps video_url to video.url, defaulting to empty string', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', video_url: 'https://cdn/v.mp4' }).video.url)
      .toBe('https://cdn/v.mp4');
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).video.url).toBe('');
  });

  it('writes video_url/video_path only when a video is provided', () => {
    const values = { title: 'T', description: 'd' };
    expect(toRow(values, null, null).video_url).toBeUndefined();
    const row = toRow(values, null, { url: 'https://cdn/v.mp4', path: 'abc.mp4' });
    expect(row.video_url).toBe('https://cdn/v.mp4');
    expect(row.video_path).toBe('abc.mp4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: FAIL — `toProject`/`toRow` not exported (import is undefined) or `video` undefined.

- [ ] **Step 3: Edit the mappers**

In `frontend/src/features/projects/api/projects.api.js`:

Add `export` to `toProject` and add the `video` field:
```js
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
    video: { url: row.video_url ?? '' },
    liveUrl: row.live_url ?? '',
    repoUrl: row.repo_url ?? '',
    featured: Boolean(row.featured)
  };
}
```

Add `export` to `toRow`, add the `video` parameter and write-through:
```js
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
    featured: Boolean(values.featured)
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/tests/unit/projects.mappers.test.js
git commit -m "feat(projects): map video fields in toProject/toRow"
```

---

### Task 3: API — `uploadVideo` + thread `videoFile` through create/update

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Test: `frontend/tests/unit/projects.upload.test.js`

**Interfaces:**
- Consumes: `toRow(values, cover, video)` from Task 2.
- Produces: `uploadVideo(file)` → `{ url, path }`; `createProject({ values, file, videoFile })` and `updateProject({ id, values, file, videoFile })` upload the video to the `project-videos` bucket when `videoFile` is set.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/projects.upload.test.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest';

const upload = vi.fn().mockResolvedValue({ error: null });
const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/test.mp4' } }));
const single = vi.fn().mockResolvedValue({
  data: { id: '1', title: 'T', slug: 't', description: 'd', video_url: 'https://cdn/test.mp4' },
  error: null
});
const select = vi.fn(() => ({ single }));
const insert = vi.fn(() => ({ select }));
const storageFrom = vi.fn(() => ({ upload, getPublicUrl }));

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({ insert })),
    storage: { from: storageFrom }
  }
}));

import { createProject } from '../../src/features/projects/api/projects.api.js';

describe('createProject — video upload', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads the video to the project-videos bucket and writes video_url', async () => {
    const videoFile = new File(['x'], 'demo.mp4', { type: 'video/mp4' });
    const result = await createProject({ values: { title: 'T', description: 'd' }, file: null, videoFile });

    expect(storageFrom).toHaveBeenCalledWith('project-videos');
    expect(upload).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ video_url: 'https://cdn/test.mp4' }));
    expect(result.video.url).toBe('https://cdn/test.mp4');
  });

  it('skips video upload when no videoFile is given', async () => {
    await createProject({ values: { title: 'T', description: 'd' }, file: null, videoFile: null });
    expect(storageFrom).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/projects.upload.test.js`
Expected: FAIL — `createProject` ignores `videoFile`; `insert` not called with `video_url`.

- [ ] **Step 3: Add `uploadVideo` and thread `videoFile`**

In `frontend/src/features/projects/api/projects.api.js`:

Add the bucket constant near `const BUCKET = 'project-images';`:
```js
const BUCKET_VIDEO = 'project-videos';
```

Add the upload helper after `uploadCover`:
```js
async function uploadVideo(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'mp4';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_VIDEO).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_VIDEO).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
```

Update `createProject`:
```js
export async function createProject({ values, file, videoFile }) {
  const cover = file ? await uploadCover(file) : null;
  const video = videoFile ? await uploadVideo(videoFile) : null;
  const { data, error } = await supabase.from('projects').insert(toRow(values, cover, video)).select().single();
  if (error) throw error;
  return toProject(data);
}
```

Update `updateProject`:
```js
export async function updateProject({ id, values, file, videoFile }) {
  const cover = file ? await uploadCover(file) : null;
  const video = videoFile ? await uploadVideo(videoFile) : null;
  const { data, error } = await supabase.from('projects').update(toRow(values, cover, video)).eq('id', id).select().single();
  if (error) throw error;
  return toProject(data);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/projects.upload.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/tests/unit/projects.upload.test.js
git commit -m "feat(projects): upload demo video to project-videos bucket"
```

---

### Task 4: Admin form — video input + client-side guard

**Files:**
- Modify: `frontend/src/features/projects/components/ProjectForm.jsx`
- Test: `frontend/tests/integration/projectForm.video.test.jsx`

**Interfaces:**
- Consumes: `onSubmit({ values, file, videoFile })` — now also passes `videoFile`.
- Produces: a labeled "Demo video" file input; rejects >50 MB or non-mp4/webm before calling `onSubmit`.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/integration/projectForm.video.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

function fileOfSize(name, type, bytes) {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: bytes });
  return f;
}

describe('ProjectForm — demo video', () => {
  it('renders a demo video input', () => {
    renderWithProviders(<ProjectForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/demo video/i)).toBeInTheDocument();
  });

  it('rejects a video larger than 50 MB without calling onSubmit', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'My Project');
    await user.type(screen.getByLabelText('Description'), 'A long enough description.');
    await user.upload(screen.getByLabelText(/demo video/i), fileOfSize('big.mp4', 'video/mp4', 60 * 1024 * 1024));
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(screen.getByText(/50 MB/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/integration/projectForm.video.test.jsx`
Expected: FAIL — no "Demo video" input found.

- [ ] **Step 3: Add the input + guard**

In `frontend/src/features/projects/components/ProjectForm.jsx`:

Change the React import to include `useState`:
```jsx
import { useState } from 'react';
```

Add constants above the component:
```jsx
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
```

Inside the component, add state (after the `useForm(...)` call):
```jsx
const [videoError, setVideoError] = useState('');
```

Replace the `submit` function with:
```jsx
const submit = (values) => {
  const videoFile = values.video?.[0] || null;
  if (videoFile) {
    if (!VIDEO_TYPES.includes(videoFile.type)) {
      setVideoError('Use an MP4 or WebM file.');
      return;
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      setVideoError('Video must be 50 MB or smaller.');
      return;
    }
  }
  setVideoError('');
  onSubmit({
    values: {
      title: values.title,
      description: values.description,
      content: values.content || '',
      tags: (values.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      liveUrl: values.liveUrl || '',
      repoUrl: values.repoUrl || '',
      featured: Boolean(values.featured)
    },
    file: values.coverImage?.[0] || null,
    videoFile
  });
};
```

Add the input block immediately after the existing cover image `<div className="grid gap-1.5">…</div>`:
```jsx
<div className="grid gap-1.5">
  <label htmlFor="video" className="font-mono text-xs uppercase text-muted">
    Demo video
  </label>
  <input id="video" type="file" accept="video/mp4,video/webm" className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('video')} />
  <p className="text-xs text-muted">MP4 or WebM, max 50 MB. Compress before upload.</p>
  {videoError ? <p role="alert" className="text-sm text-danger">{videoError}</p> : null}
</div>
```

Add `video` to the zod schema object (so `register('video')` is part of the form):
```js
  coverImage: z.any().optional(),
  video: z.any().optional()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/integration/projectForm.video.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/components/ProjectForm.jsx frontend/tests/integration/projectForm.video.test.jsx
git commit -m "feat(projects): add demo video upload field with size/type guard"
```

---

### Task 5: Detail page — lazy `<video>` playback

**Files:**
- Modify: `frontend/src/pages/public/ProjectDetail.jsx`
- Test: `frontend/tests/integration/projectDetail.video.test.jsx`

**Interfaces:**
- Consumes: `project.video.url` and `project.coverImage.url` from the mapped project.
- Produces: a `<video controls preload="none" src poster>` rendered in the media slot when `project.video?.url` is truthy; otherwise the existing image/gradient fallback.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/integration/projectDetail.video.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectDetail from '../../src/pages/public/ProjectDetail.jsx';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProject: vi.fn().mockResolvedValue({
    _id: '1', title: 'T', slug: 'test', description: 'd', content: '', tags: [],
    coverImage: { url: 'https://cdn/c.jpg' }, liveUrl: '', repoUrl: '', featured: false,
    video: { url: 'https://cdn/v.mp4' }
  }),
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

describe('ProjectDetail — demo video', () => {
  it('renders a lazy video player when the project has a video', async () => {
    const { container } = renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );

    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn/v.mp4');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('poster', 'https://cdn/c.jpg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/integration/projectDetail.video.test.jsx`
Expected: FAIL — no `<video>` element in the document.

- [ ] **Step 3: Render the video in the media slot**

In `frontend/src/pages/public/ProjectDetail.jsx`, replace the media block (the
`{project.coverImage?.url ? (<img …/>) : (<div …monogram…/>)}` expression) with a
video-first version:

```jsx
{project.video?.url ? (
  <video
    controls
    preload="none"
    src={project.video.url}
    poster={project.coverImage?.url || undefined}
    className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
  />
) : project.coverImage?.url ? (
  <img
    src={project.coverImage.url}
    alt=""
    className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
  />
) : (
  <div
    className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-border"
    style={{ backgroundImage: coverGradient(project) }}
  >
    <span className="font-display text-6xl font-bold text-white/90">{monogram(project.title)}</span>
  </div>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/integration/projectDetail.video.test.jsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/public/ProjectDetail.jsx frontend/tests/integration/projectDetail.video.test.jsx
git commit -m "feat(projects): lazy demo video player on project detail"
```

---

### Task 6: Grid card — DEMO badge (no video bytes)

**Files:**
- Modify: `frontend/src/features/projects/components/ProjectCard.jsx`
- Test: `frontend/tests/unit/projectCard.video.test.jsx`

**Interfaces:**
- Consumes: `project.video.url`.
- Produces: a `▶ DEMO` badge near the FEATURED badge when a video exists; no `<video>` element on the card.

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/projectCard.video.test.jsx`:

```jsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectCard } from '../../src/features/projects/components/ProjectCard.jsx';

const base = { slug: 't', title: 'T', description: 'd', tags: [], coverImage: { url: 'https://cdn/c.jpg' } };

const renderCard = (project) =>
  render(<MemoryRouter><ProjectCard project={project} /></MemoryRouter>);

describe('ProjectCard — demo badge', () => {
  it('shows a DEMO badge when the project has a video', () => {
    renderCard({ ...base, video: { url: 'https://cdn/v.mp4' } });
    expect(screen.getByText(/DEMO/)).toBeInTheDocument();
  });

  it('does not show a DEMO badge without a video, and never renders a <video>', () => {
    const { container } = renderCard({ ...base, video: { url: '' } });
    expect(screen.queryByText(/DEMO/)).not.toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/projectCard.video.test.jsx`
Expected: FAIL — no DEMO badge found.

- [ ] **Step 3: Add the badge**

In `frontend/src/features/projects/components/ProjectCard.jsx`, extend the badge
row (the `<div className="absolute left-4 top-4 flex gap-2">…</div>`) to include
the DEMO badge:

```jsx
<div className="absolute left-4 top-4 flex gap-2">
  {project.featured && (
    <span className="rounded-full bg-bg/70 px-3 py-1 font-mono text-[10px] tracking-eyebrow text-ink backdrop-blur">
      FEATURED
    </span>
  )}
  {project.video?.url && (
    <span className="rounded-full bg-bg/70 px-3 py-1 font-mono text-[10px] tracking-eyebrow text-ink backdrop-blur">
      ▶ DEMO
    </span>
  )}
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/projectCard.video.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/components/ProjectCard.jsx frontend/tests/unit/projectCard.video.test.jsx
git commit -m "feat(projects): demo badge on cards with a video"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `cd frontend && npm test`
Expected: all tests pass, including the 5 new files from Tasks 2–6.

- [ ] **Step 2: Production build**

Run: `cd frontend && npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 3: Manual smoke (admin → public)**

With the dev server (`npm run dev`) and the migration applied:
1. Log into `/admin`, edit a project, upload a small (<50 MB) mp4 → save succeeds.
2. Open that project's detail page → poster shows, video plays on click; Network tab shows the video request fires only on play.
3. Projects grid → that card shows the `▶ DEMO` badge; no video request on grid load.
4. Try a >50 MB file in the form → inline "50 MB or smaller" error, no upload.

- [ ] **Step 4: Push**

```bash
git push origin main
```
(Run from a terminal where git credential auth can complete.)

---

## Notes

- `fallbackData.js` placeholder projects need no change — `project.video?.url` optional chaining renders nothing when absent.
- No new frontend env vars; deploys via the existing Vercel pipeline (Root Directory `frontend`).
- `crypto.randomUUID()` is available in the jsdom/node test env and the browser; no polyfill needed.
