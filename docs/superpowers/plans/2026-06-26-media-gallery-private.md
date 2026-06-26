# Media Gallery, Private Flag & Screenshots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a video play-overlay component, a private/NDA flag, multiple-screenshot upload, and a detail-page media slideshow that combines the video and screenshots.

**Architecture:** A reusable `VideoPlayer` (lazy, centered blurred play button) is composed by a new `MediaGallery` carousel that becomes the detail-page media slot (video slide + screenshot slides, auto-advancing). A new DB migration adds `is_private` + `screenshots`; the projects API maps/uploads them; `ProjectForm` gains a private checkbox and screenshot management.

**Tech Stack:** React 18, Vite 6, `@supabase/supabase-js` ^2.45, React Query 5, react-hook-form + zod, Tailwind, lucide-react, Vitest + Testing Library.

## Global Constraints

- Build order: B (VideoPlayer) → A (private) → C (screenshots data+admin) → D (MediaGallery).
- Private = hide ONLY Live/Source links + show NDA notice; video/screenshots still shown.
- Slideshow is the main media slot; video is one slide; auto-advance 5000ms; pause on hover AND while video is playing.
- Max 8 screenshots per project (client guard).
- Screenshots stored in the existing public `project-images` bucket (BUCKET constant). Video bucket is `BUCKET_VIDEO = 'project-videos'`.
- All storage deletes are best-effort (`.catch(() => {})`) AFTER a successful DB write; never block it.
- Media element aspect ratio is `aspect-[16/10]`, `rounded-2xl border border-border` (match existing detail media).
- Never `git add -A` — stage exact paths. Run vitest from the `frontend/` directory.
- DB migration is written by the implementer but APPLIED by the user (`supabase db push`); do not run it.

---

### Task 1: DB migration — is_private + screenshots

**Files:**
- Create: `backend/supabase/migrations/20260626120000_project_private_screenshots.sql`

**Interfaces:**
- Produces: `projects.is_private` (boolean, default false), `projects.screenshots` (jsonb, default `[]`).

- [ ] **Step 1: Write the migration**

Create `backend/supabase/migrations/20260626120000_project_private_screenshots.sql`:

```sql
-- Private/NDA flag + multiple screenshots per project. Screenshots are stored
-- as a jsonb array of {url, path} objects in the existing public project-images
-- bucket (no new bucket/policies needed; existing projects RLS covers the row).
alter table public.projects
  add column if not exists is_private  boolean not null default false,
  add column if not exists screenshots jsonb   not null default '[]'::jsonb;
```

- [ ] **Step 2: Do NOT apply it**

The user runs `cd backend && npx supabase db push`. Do not run migrations or start Docker.

- [ ] **Step 3: Commit**

```bash
git add backend/supabase/migrations/20260626120000_project_private_screenshots.sql
git commit -m "feat(db): add is_private and screenshots columns to projects"
```

---

### Task 2: `VideoPlayer` component (feature B)

**Files:**
- Create: `frontend/src/features/projects/components/VideoPlayer.jsx`
- Test: `frontend/tests/unit/videoPlayer.test.jsx`

**Interfaces:**
- Produces: `VideoPlayer({ src, poster, onPlayingChange })` — renders a Play button until clicked, then a lazy `<video autoPlay controls src>`; calls `onPlayingChange(boolean)` on play/pause/ended.

- [ ] **Step 1: Write the failing test (create EXACTLY this)**

`frontend/tests/unit/videoPlayer.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from '../../src/features/projects/components/VideoPlayer.jsx';

describe('VideoPlayer', () => {
  it('shows a Play button and no video before clicking', () => {
    const { container } = render(<VideoPlayer src="https://cdn/v.mp4" poster="https://cdn/c.jpg" />);
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
  });

  it('mounts an autoplay video with the src after clicking Play', async () => {
    const user = userEvent.setup();
    const onPlayingChange = vi.fn();
    const { container } = render(<VideoPlayer src="https://cdn/v.mp4" poster="https://cdn/c.jpg" onPlayingChange={onPlayingChange} />);
    await user.click(screen.getByRole('button', { name: /play video/i }));
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', 'https://cdn/v.mp4');
    expect(video.autoplay).toBe(true);
    expect(onPlayingChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/videoPlayer.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the component (EXACTLY)**

`frontend/src/features/projects/components/VideoPlayer.jsx`:

```jsx
import { useState } from 'react';
import { Play } from 'lucide-react';

export function VideoPlayer({ src, poster, onPlayingChange }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        type="button"
        aria-label="Play video"
        onClick={() => {
          setPlaying(true);
          onPlayingChange?.(true);
        }}
        className="group grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-2xl border border-border bg-cover bg-center"
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-bg/40 backdrop-blur-md transition group-hover:bg-bg/60">
          <Play aria-hidden="true" size={28} className="translate-x-0.5 text-ink" />
        </span>
      </button>
    );
  }

  return (
    <video
      src={src}
      autoPlay
      controls
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
      onEnded={() => onPlayingChange?.(false)}
      className="aspect-[16/10] w-full rounded-2xl border border-border object-cover"
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/videoPlayer.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/components/VideoPlayer.jsx frontend/tests/unit/videoPlayer.test.jsx
git commit -m "feat(projects): lazy VideoPlayer with centered play overlay"
```

---

### Task 3: Private / NDA flag (feature A)

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Modify: `frontend/src/features/projects/components/ProjectForm.jsx`
- Modify: `frontend/src/pages/public/ProjectDetail.jsx`
- Test: `frontend/tests/unit/projects.mappers.test.js` (extend)
- Test: `frontend/tests/integration/projectDetail.private.test.jsx` (create)

**Interfaces:**
- Produces: `toProject(row).isPrivate` (boolean); `toRow` writes `is_private`; `ProjectForm` emits `values.isPrivate`; `ProjectDetail` shows an NDA notice when `project.isPrivate`.

- [ ] **Step 1: Add the failing mapper test**

Append inside the existing `describe('projects mappers — video', ...)` block in `frontend/tests/unit/projects.mappers.test.js`:

```js
  it('maps is_private to isPrivate and writes it back', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', is_private: true }).isPrivate).toBe(true);
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).isPrivate).toBe(false);
    expect(toRow({ title: 'T', description: 'd', isPrivate: true }, null, null).is_private).toBe(true);
    expect(toRow({ title: 'T', description: 'd' }, null, null).is_private).toBe(false);
  });
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: FAIL — `isPrivate`/`is_private` undefined.

- [ ] **Step 3: Map the flag in `projects.api.js`**

In `toProject`, add after the `video:` line:
```js
    isPrivate: Boolean(row.is_private),
```
In `toRow`, add `is_private` to the base `row` object (next to `featured`):
```js
    featured: Boolean(values.featured),
    is_private: Boolean(values.isPrivate)
```

- [ ] **Step 4: Run, confirm PASS**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: PASS.

- [ ] **Step 5: Add the private detail test (create EXACTLY this)**

`frontend/tests/integration/projectDetail.private.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import ProjectDetail from '../../src/pages/public/ProjectDetail.jsx';
import { fetchProject } from '../../src/features/projects/api/projects.api.js';

vi.mock('../../src/features/projects/api/projects.api.js', () => ({
  fetchProject: vi.fn(),
  fetchProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn()
}));

const base = {
  _id: '1', title: 'T', slug: 'test', description: 'd', content: '', tags: [],
  coverImage: { url: 'https://cdn/c.jpg' }, video: { url: '', path: '' }, screenshots: [],
  liveUrl: 'https://live.example', repoUrl: 'https://github.com/x/y'
};

describe('ProjectDetail — private flag', () => {
  it('shows the NDA notice and hides Live/Source when private', async () => {
    fetchProject.mockResolvedValue({ ...base, isPrivate: true });
    renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );
    await waitFor(() => expect(screen.getByText(/under NDA/i)).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /live/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /source/i })).toBeNull();
  });

  it('shows Live/Source when not private', async () => {
    fetchProject.mockResolvedValue({ ...base, isPrivate: false });
    renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );
    await waitFor(() => expect(screen.getByRole('link', { name: /live/i })).toBeInTheDocument());
    expect(screen.queryByText(/under NDA/i)).toBeNull();
  });
});
```

- [ ] **Step 6: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/integration/projectDetail.private.test.jsx`
Expected: FAIL — no NDA notice.

- [ ] **Step 7: ProjectForm — add the checkbox**

In `frontend/src/features/projects/components/ProjectForm.jsx`:

Add to the zod `schema` object:
```js
  isPrivate: z.boolean().optional(),
```
Add to `defaultValues`:
```js
      featured: Boolean(project?.featured),
      isPrivate: Boolean(project?.isPrivate)
```
Add `isPrivate` to the submitted `values` object (next to `featured`):
```js
        featured: Boolean(values.featured),
        isPrivate: Boolean(values.isPrivate)
```
Add a checkbox right AFTER the existing "Featured project" `<label>...</label>`:
```jsx
<label className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted">
  <input type="checkbox" className="h-4 w-4 accent-accent" {...register('isPrivate')} />
  Private / under NDA
</label>
```

- [ ] **Step 8: ProjectDetail — NDA notice**

In `frontend/src/pages/public/ProjectDetail.jsx`:

Change the import on line 1 to add `Lock`:
```jsx
import { ArrowLeft, ExternalLink, Github, Lock } from 'lucide-react';
```
Replace the buttons `<div className="mt-7 flex flex-wrap gap-3"> ... </div>` block with:
```jsx
<div className="mt-7 flex flex-wrap gap-3">
  {project.isPrivate ? (
    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-4 py-2 text-sm text-muted">
      <Lock aria-hidden="true" size={15} /> Private — code &amp; demo under NDA
    </p>
  ) : (
    <>
      {project.liveUrl ? (
        <Button as="a" href={project.liveUrl} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden="true" size={17} />
          Live
        </Button>
      ) : null}
      {project.repoUrl ? (
        <Button as="a" href={project.repoUrl} target="_blank" rel="noreferrer" variant="outline">
          <Github aria-hidden="true" size={17} />
          Source
        </Button>
      ) : null}
    </>
  )}
</div>
```

- [ ] **Step 9: Run the private + mapper tests, confirm PASS**

Run: `cd frontend && npx vitest run tests/integration/projectDetail.private.test.jsx tests/unit/projects.mappers.test.js`
Expected: PASS (private 2 tests; mappers all pass).

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/src/features/projects/components/ProjectForm.jsx frontend/src/pages/public/ProjectDetail.jsx frontend/tests/unit/projects.mappers.test.js frontend/tests/integration/projectDetail.private.test.jsx
git commit -m "feat(projects): private/NDA flag with admin checkbox and detail notice"
```

---

### Task 4: Screenshots — data + API (feature C, data)

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Test: `frontend/tests/unit/projects.mappers.test.js` (extend)
- Test: `frontend/tests/unit/projects.screenshots.test.js` (create)

**Interfaces:**
- Produces: `toProject(row).screenshots` = `[{url, path}]`; `uploadScreenshot(file)` → `{url, path}`; `createProject`/`updateProject` accept `screenshotFiles`, `removeScreenshotPaths`, `existingScreenshots`.

- [ ] **Step 1: Add the failing mapper test**

Append inside the existing `describe('projects mappers — video', ...)` block in `frontend/tests/unit/projects.mappers.test.js`:

```js
  it('maps screenshots array, defaulting to []', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', screenshots: [{ url: 'u', path: 'p' }] }).screenshots)
      .toEqual([{ url: 'u', path: 'p' }]);
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).screenshots).toEqual([]);
  });
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: FAIL — `screenshots` undefined.

- [ ] **Step 3: Map screenshots in `toProject`**

In `toProject`, add after the `isPrivate:` line:
```js
    screenshots: Array.isArray(row.screenshots)
      ? row.screenshots.map((s) => ({ url: s.url ?? '', path: s.path ?? '' }))
      : [],
```

- [ ] **Step 4: Run, confirm mapper PASS**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: PASS.

- [ ] **Step 5: Write the failing screenshots API test (create EXACTLY this)**

`frontend/tests/unit/projects.screenshots.test.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/shot.png' } }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({
    data: { id: '1', title: 'T', slug: 't', description: 'd', screenshots: [] }, error: null
  });
  const select = vi.fn(() => ({ single }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const storageFrom = vi.fn(() => ({ upload, getPublicUrl, remove }));
  return { upload, getPublicUrl, remove, single, select, eq, update, storageFrom };
});

vi.mock('../../src/lib/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({ update: m.update })),
    storage: { from: m.storageFrom }
  }
}));

import { updateProject } from '../../src/features/projects/api/projects.api.js';

const VALUES = { title: 'T', description: 'd' };

describe('updateProject — screenshots', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uploads new screenshots and appends them to the kept ones', async () => {
    const file = new File(['x'], 's.png', { type: 'image/png' });
    await updateProject({
      id: '1', values: VALUES, file: null, videoFile: null,
      screenshotFiles: [file], removeScreenshotPaths: [],
      existingScreenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }]
    });
    expect(m.upload).toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row.screenshots).toEqual([
      { url: 'https://cdn/a.png', path: 'a.png' },
      { url: 'https://cdn/shot.png', path: expect.any(String) }
    ]);
  });

  it('removes selected screenshots and deletes their objects', async () => {
    await updateProject({
      id: '1', values: VALUES, file: null, videoFile: null,
      screenshotFiles: [], removeScreenshotPaths: ['a.png'],
      existingScreenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }, { url: 'https://cdn/b.png', path: 'b.png' }]
    });
    const row = m.update.mock.calls[0][0];
    expect(row.screenshots).toEqual([{ url: 'https://cdn/b.png', path: 'b.png' }]);
    expect(m.remove).toHaveBeenCalledWith(['a.png']);
  });

  it('leaves screenshots untouched when there is no screenshot change', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, screenshotFiles: [], removeScreenshotPaths: [] });
    const row = m.update.mock.calls[0][0];
    expect(row).not.toHaveProperty('screenshots');
    expect(m.remove).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/unit/projects.screenshots.test.js`
Expected: FAIL — updateProject ignores screenshot params.

- [ ] **Step 7: Implement uploadScreenshot + resolveScreenshots + wire create/update**

In `frontend/src/features/projects/api/projects.api.js`:

Add this helper after `uploadVideo`:
```js
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
```

Replace `createProject` with EXACTLY:
```js
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
```

Replace `updateProject` with EXACTLY:
```js
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
```

- [ ] **Step 8: Run the screenshots + prior update/upload tests, confirm PASS**

Run: `cd frontend && npx vitest run tests/unit/projects.screenshots.test.js tests/unit/projects.update.test.js tests/unit/projects.upload.test.js`
Expected: PASS (3 + 3 + 2).

- [ ] **Step 9: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/tests/unit/projects.mappers.test.js frontend/tests/unit/projects.screenshots.test.js
git commit -m "feat(projects): screenshots mapping, upload, and create/update wiring"
```

---

### Task 5: Screenshots — admin form (feature C, UI)

**Files:**
- Modify: `frontend/src/features/projects/components/ProjectForm.jsx`
- Test: `frontend/tests/integration/projectForm.screenshots.test.jsx` (create)

**Interfaces:**
- Consumes: `project.screenshots` (`[{url, path}]`).
- Produces: submit payload gains `screenshotFiles` (File[]), `removeScreenshotPaths` (string[]), `existingScreenshots` (the current array).

- [ ] **Step 1: Write the failing test (create EXACTLY this)**

`frontend/tests/integration/projectForm.screenshots.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

const withShots = {
  _id: '1', title: 'My Project', description: 'A long enough description.', tags: [],
  coverImage: { url: '' }, video: { url: '', path: '' },
  screenshots: [{ url: 'https://cdn/a.png', path: 'a.png' }, { url: 'https://cdn/b.png', path: 'b.png' }]
};

function imageFiles(n) {
  return Array.from({ length: n }, (_, i) => new File(['x'], `s${i}.png`, { type: 'image/png' }));
}

describe('ProjectForm — screenshots', () => {
  it('lists existing screenshots and emits removed paths on save', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm project={withShots} onSubmit={onSubmit} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove screenshot/i });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[0]);
    expect(screen.getAllByRole('button', { name: /remove screenshot/i })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /save project/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ removeScreenshotPaths: ['a.png'] });
  });

  it('blocks save when more than 8 screenshots total', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ProjectForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), 'My Project');
    await user.type(screen.getByLabelText('Description'), 'A long enough description.');
    await user.upload(screen.getByLabelText(/screenshots/i), imageFiles(9));
    await user.click(screen.getByRole('button', { name: /save project/i }));

    await waitFor(() => expect(screen.getByText(/max 8 screenshots/i)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/integration/projectForm.screenshots.test.jsx`
Expected: FAIL — no remove buttons / screenshots input.

- [ ] **Step 3: Add screenshot management to `ProjectForm.jsx`**

(a) Add `MAX_SCREENSHOTS` next to the other consts at module scope:
```js
const MAX_SCREENSHOTS = 8;
```
(b) Add `screenshots: z.any().optional()` to the zod `schema`.
(c) Add state after the `removeVideo` state line:
```js
const [removeShotPaths, setRemoveShotPaths] = useState([]);
const [shotError, setShotError] = useState('');
const existingShots = (project?.screenshots || []).filter((s) => !removeShotPaths.includes(s.path));
```
(d) In `submit`, BEFORE the `onSubmit({...})` call, compute and guard:
```js
const screenshotFiles = Array.from(values.screenshots || []);
const keptShots = (project?.screenshots || []).filter((s) => !removeShotPaths.includes(s.path));
if (keptShots.length + screenshotFiles.length > MAX_SCREENSHOTS) {
  setShotError(`Max ${MAX_SCREENSHOTS} screenshots.`);
  return;
}
setShotError('');
```
(e) Add these three fields to the `onSubmit({...})` payload (after `currentVideoPath`):
```js
    screenshotFiles,
    removeScreenshotPaths: removeShotPaths,
    existingScreenshots: project?.screenshots || []
```
(f) Add the UI block right AFTER the entire "Demo video" `<div className="grid gap-1.5"> ... </div>` block and BEFORE the submit `<Button>`:
```jsx
<div className="grid gap-1.5">
  <label htmlFor="screenshots" className="font-mono text-xs uppercase text-muted">
    Screenshots
  </label>
  {existingShots.length ? (
    <div className="flex flex-wrap gap-2">
      {existingShots.map((shot, i) => (
        <div key={shot.path} className="relative">
          <img src={shot.url} alt="" className="h-16 w-24 rounded-md border border-border object-cover" />
          <button
            type="button"
            aria-label={`Remove screenshot ${i + 1}`}
            onClick={() => setRemoveShotPaths((prev) => [...prev, shot.path])}
            className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-danger text-xs text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  ) : null}
  <input id="screenshots" type="file" accept="image/*" multiple className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('screenshots')} />
  <p className="text-xs text-muted">Up to {MAX_SCREENSHOTS} images.</p>
  {shotError ? <p role="alert" className="text-sm text-danger">{shotError}</p> : null}
</div>
```

- [ ] **Step 4: Run, confirm PASS**

Run: `cd frontend && npx vitest run tests/integration/projectForm.screenshots.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: No-regression on the other form tests**

Run: `cd frontend && npx vitest run tests/integration/projectForm.video.test.jsx tests/integration/projectForm.remove.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/projects/components/ProjectForm.jsx frontend/tests/integration/projectForm.screenshots.test.jsx
git commit -m "feat(projects): screenshot thumbnails, multi-upload, and 8-cap guard"
```

---

### Task 6: `MediaGallery` + ProjectDetail integration (feature D)

**Files:**
- Create: `frontend/src/features/projects/components/MediaGallery.jsx`
- Modify: `frontend/src/pages/public/ProjectDetail.jsx`
- Test: `frontend/tests/unit/mediaGallery.test.jsx` (create)
- Test: `frontend/tests/integration/projectDetail.video.test.jsx` (replace assertions)

**Interfaces:**
- Consumes: `VideoPlayer`, `coverGradient`, `monogram`.
- Produces: `MediaGallery({ video, screenshots, coverImage, title })` — a carousel media slot.

- [ ] **Step 1: Write the failing gallery test (create EXACTLY this)**

`frontend/tests/unit/mediaGallery.test.jsx`:

```jsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaGallery } from '../../src/features/projects/components/MediaGallery.jsx';

describe('MediaGallery', () => {
  it('builds slides from video + screenshots with dot controls', async () => {
    const user = userEvent.setup();
    render(
      <MediaGallery
        video={{ url: 'https://cdn/v.mp4' }}
        screenshots={[{ url: 'https://cdn/a.png', path: 'a' }, { url: 'https://cdn/b.png', path: 'b' }]}
        coverImage={{ url: 'https://cdn/c.jpg' }}
        title="T"
      />
    );
    expect(screen.getAllByRole('button', { name: /go to slide/i })).toHaveLength(3);
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.queryByRole('button', { name: /play video/i })).toBeNull();
  });

  it('falls back to the cover image when there are no slides', () => {
    const { container } = render(
      <MediaGallery video={{ url: '' }} screenshots={[]} coverImage={{ url: 'https://cdn/c.jpg' }} title="T" />
    );
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /go to slide/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run, confirm FAIL**

Run: `cd frontend && npx vitest run tests/unit/mediaGallery.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `MediaGallery.jsx` (EXACTLY)**

`frontend/src/features/projects/components/MediaGallery.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer.jsx';
import { coverGradient, monogram } from '../cover.js';

const MEDIA_CLASS = 'aspect-[16/10] w-full rounded-2xl border border-border object-cover';

export function MediaGallery({ video, screenshots = [], coverImage, title }) {
  const slides = [];
  if (video?.url) slides.push({ type: 'video', url: video.url });
  for (const s of screenshots) if (s?.url) slides.push({ type: 'image', url: s.url });

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (count < 2 || hovered || videoPlaying) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(timer);
  }, [count, hovered, videoPlaying]);

  if (count === 0) {
    return coverImage?.url ? (
      <img src={coverImage.url} alt="" className={MEDIA_CLASS} />
    ) : (
      <div
        className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-border"
        style={{ backgroundImage: coverGradient({ title }) }}
      >
        <span className="font-display text-6xl font-bold text-white/90">{monogram(title)}</span>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {current.type === 'video' ? (
        <VideoPlayer src={current.url} poster={coverImage?.url} onPlayingChange={setVideoPlaying} />
      ) : (
        <img src={current.url} alt="" className={MEDIA_CLASS} />
      )}
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 backdrop-blur"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg/60 backdrop-blur"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-ink' : 'bg-ink/40'}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run, confirm gallery PASS**

Run: `cd frontend && npx vitest run tests/unit/mediaGallery.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire MediaGallery into ProjectDetail**

In `frontend/src/pages/public/ProjectDetail.jsx`:

Change the cover import (line 8) to import the gallery instead:
```jsx
import { MediaGallery } from '../../features/projects/components/MediaGallery.jsx';
```
(Remove the `import { coverGradient, monogram } from '../../features/projects/cover.js';` line — the gallery owns the fallback now.)

Replace the ENTIRE media block (the `{project.video?.url ? (<video .../>) : project.coverImage?.url ? (<img .../>) : (<div ...monogram...>)}` expression) with:
```jsx
<MediaGallery
  video={project.video}
  screenshots={project.screenshots}
  coverImage={project.coverImage}
  title={project.title}
/>
```

- [ ] **Step 6: Replace the old detail video test assertions**

Replace the body of the test in `frontend/tests/integration/projectDetail.video.test.jsx` so it asserts the gallery's Play button instead of an inline `<video>` (the lazy `<video preload="none">` no longer exists — the video is now behind the VideoPlayer Play button). Replace the single `it(...)` with EXACTLY:

```jsx
  it('renders the video as a play button in the media gallery', async () => {
    const { container } = renderWithProviders(
      <Routes><Route path="/projects/:slug" element={<ProjectDetail />} /></Routes>,
      { route: '/projects/test' }
    );

    await waitFor(() => expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument());
    expect(container.querySelector('video')).toBeNull();
  });
```

Also add `screen` to the import from `@testing-library/react` at the top of that file if not present:
```jsx
import { screen, waitFor } from '@testing-library/react';
```
And ensure the mocked `fetchProject` resolves an object that includes `screenshots: []` (add `screenshots: []` to the mocked project object if missing).

- [ ] **Step 7: Run the detail video + gallery tests, confirm PASS**

Run: `cd frontend && npx vitest run tests/integration/projectDetail.video.test.jsx tests/unit/mediaGallery.test.jsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/projects/components/MediaGallery.jsx frontend/src/pages/public/ProjectDetail.jsx frontend/tests/unit/mediaGallery.test.jsx frontend/tests/integration/projectDetail.video.test.jsx
git commit -m "feat(projects): MediaGallery slideshow as the detail media slot"
```

---

### Task 7: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `cd frontend && npm test`
Expected: all tests pass (the suite was 34; this adds VideoPlayer 2, private 2 + 1 mapper, screenshots 3 + 1 mapper + form 2, gallery 2, and the rewritten detail video test).

- [ ] **Step 2: Production build**

Run: `cd frontend && npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 3: Manual smoke (needs migration applied + admin login)**

1. Admin → edit a project → check "Private / under NDA" → save → detail page shows "Private — code & demo under NDA" and no Live/Source.
2. Admin → upload 2–3 screenshots → save → detail media slot is a carousel: video slide (Play button) + screenshot slides, with dots + prev/next; it auto-advances every 5s and pauses on hover / while the video plays.
3. Remove a screenshot in admin → save → it disappears from the carousel and from the `project-images` bucket.
4. Try uploading >8 screenshots → inline "Max 8 screenshots." and no save.

---

## Notes

- `ProjectEditor.jsx` needs NO change — it spreads the form payload into `mutation.mutate({ id, ...payload })`, so the new screenshot/private fields flow through.
- `MediaGallery` fallback uses `coverGradient({ title })`; the no-media gradient is keyed on title only (slug isn't passed) — acceptable cosmetic difference from the card, which is fine since this path only hits when a project has no media at all.
- Auto-advance is not asserted on a real timer in tests (kept deterministic); its structure (interval gated on count/hover/videoPlaying) is exercised by the gallery render tests.
