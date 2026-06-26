# Video Remove / Replace Edit Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the admin remove an existing project video or replace it, deleting the old storage object, with an inline preview + Remove control on the edit form.

**Architecture:** Expose `video.path` from the mapper, extend `updateProject` to clear video columns (remove) or overwrite them (replace) and best-effort-delete the old storage object, and add a preview + Remove button to `ProjectForm` that emits `removeVideo` + `currentVideoPath` in the submit payload.

**Tech Stack:** React 18, Vite 6, `@supabase/supabase-js` ^2.45, React Query 5, react-hook-form + zod, Tailwind, Vitest + Testing Library.

## Global Constraints

- New-upload precedence: when both a new `videoFile` and `removeVideo` are present, the upload wins (replace, not clear).
- Old-file cleanup is BEST-EFFORT: delete the old object only after a successful DB update, and swallow a storage-delete failure (`.catch(() => {})`) — never block the DB update on it.
- `createProject` is unchanged (a new project has no prior video).
- `toRow` is unchanged — passing `null` as its `video` arg means "leave video columns untouched".
- Video bucket constant is `BUCKET_VIDEO = 'project-videos'` (already defined in the file).
- Existing cover-image behavior and the existing demo-video upload/guard must remain unchanged.
- Never `git add -A` — stage exact paths. Run vitest from the `frontend/` directory.

---

### Task 1: Expose `video.path` from `toProject`

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Test: `frontend/tests/unit/projects.mappers.test.js` (extend existing)

**Interfaces:**
- Produces: `toProject(row).video` is now `{ url: string, path: string }` (path defaults to `''`).

- [ ] **Step 1: Add the failing test**

Append this `it` block inside the existing `describe('projects mappers — video', ...)` in `frontend/tests/unit/projects.mappers.test.js`:

```js
  it('maps video_path to video.path, defaulting to empty string', () => {
    expect(toProject({ id: '1', title: 'T', slug: 't', description: 'd', video_path: 'abc.mp4' }).video.path)
      .toBe('abc.mp4');
    expect(toProject({ id: '2', title: 'T', slug: 't2', description: 'd' }).video.path).toBe('');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: FAIL — `video.path` is `undefined`.

- [ ] **Step 3: Add `path` to the mapper**

In `frontend/src/features/projects/api/projects.api.js`, change the `video` line in `toProject` from:
```js
    video: { url: row.video_url ?? '' },
```
to:
```js
    video: { url: row.video_url ?? '', path: row.video_path ?? '' },
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/projects.mappers.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/tests/unit/projects.mappers.test.js
git commit -m "feat(projects): expose video.path from toProject"
```

---

### Task 2: `updateProject` — remove / replace + old-file cleanup

**Files:**
- Modify: `frontend/src/features/projects/api/projects.api.js`
- Test: `frontend/tests/unit/projects.update.test.js` (create)

**Interfaces:**
- Consumes: `toRow(values, cover, null)` (base row, video columns untouched); `uploadVideo(file)` → `{ url, path }`; `BUCKET_VIDEO`.
- Produces: `updateProject({ id, values, file, videoFile, removeVideo, currentVideoPath })`.

- [ ] **Step 1: Write the failing test (create EXACTLY this)**

`frontend/tests/unit/projects.update.test.js`:

```js
import { describe, expect, it, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://cdn/new.mp4' } }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({
    data: { id: '1', title: 'T', slug: 't', description: 'd' }, error: null
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

describe('updateProject — remove / replace', () => {
  beforeEach(() => vi.clearAllMocks());

  it('remove: nulls the columns and deletes the old object', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, removeVideo: true, currentVideoPath: 'old.mp4' });
    const row = m.update.mock.calls[0][0];
    expect(row).toHaveProperty('video_url', null);
    expect(row).toHaveProperty('video_path', null);
    expect(m.remove).toHaveBeenCalledWith(['old.mp4']);
  });

  it('replace: uploads new, writes new url/path, deletes old object', async () => {
    const videoFile = new File(['x'], 'new.mp4', { type: 'video/mp4' });
    await updateProject({ id: '1', values: VALUES, file: null, videoFile, removeVideo: false, currentVideoPath: 'old.mp4' });
    expect(m.upload).toHaveBeenCalled();
    const row = m.update.mock.calls[0][0];
    expect(row).toHaveProperty('video_url', 'https://cdn/new.mp4');
    expect(row.video_path).toBeTruthy();
    expect(m.remove).toHaveBeenCalledWith(['old.mp4']);
  });

  it('no change: leaves video columns absent and does not delete', async () => {
    await updateProject({ id: '1', values: VALUES, file: null, videoFile: null, removeVideo: false, currentVideoPath: 'old.mp4' });
    const row = m.update.mock.calls[0][0];
    expect(row).not.toHaveProperty('video_url');
    expect(row).not.toHaveProperty('video_path');
    expect(m.remove).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/unit/projects.update.test.js`
Expected: FAIL — current `updateProject` ignores `removeVideo`/`currentVideoPath` and never calls `remove`.

- [ ] **Step 3: Replace `updateProject`**

In `frontend/src/features/projects/api/projects.api.js`, replace the entire `updateProject` function with EXACTLY:

```js
export async function updateProject({ id, values, file, videoFile, removeVideo, currentVideoPath }) {
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
  const { data, error } = await supabase.from('projects').update(row).eq('id', id).select().single();
  if (error) throw error;
  if ((videoFile || removeVideo) && currentVideoPath) {
    await supabase.storage.from(BUCKET_VIDEO).remove([currentVideoPath]).catch(() => {});
  }
  return toProject(data);
}
```

Do not change `createProject`, `uploadVideo`, `uploadCover`, the mappers, or any other function.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/unit/projects.update.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/projects/api/projects.api.js frontend/tests/unit/projects.update.test.js
git commit -m "feat(projects): updateProject remove/replace video + old-file cleanup"
```

---

### Task 3: Form — preview + Remove control

**Files:**
- Modify: `frontend/src/features/projects/components/ProjectForm.jsx`
- Test: `frontend/tests/integration/projectForm.remove.test.jsx` (create)

**Interfaces:**
- Consumes: `project.video.url`, `project.video.path`, `project.coverImage.url`.
- Produces: submit payload gains `removeVideo` (boolean) and `currentVideoPath` (string|null).

- [ ] **Step 1: Write the failing test (create EXACTLY this)**

`frontend/tests/integration/projectForm.remove.test.jsx`:

```jsx
import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/test/renderWithProviders.jsx';
import { ProjectForm } from '../../src/features/projects/components/ProjectForm.jsx';

const projectWithVideo = {
  _id: '1', title: 'My Project', description: 'A long enough description.', tags: [],
  coverImage: { url: 'https://cdn/c.jpg' }, liveUrl: '', repoUrl: '', featured: false,
  video: { url: 'https://cdn/v.mp4', path: 'v.mp4' }
};

describe('ProjectForm — remove/replace', () => {
  it('shows a preview + Remove button and emits removeVideo on save', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithProviders(
      <ProjectForm project={projectWithVideo} onSubmit={onSubmit} />
    );

    expect(container.querySelector('video')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove video/i }));
    expect(container.querySelector('video')).toBeNull();

    await user.click(screen.getByRole('button', { name: /save project/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ removeVideo: true, currentVideoPath: 'v.mp4' });
  });

  it('a new project shows no preview or Remove button', () => {
    renderWithProviders(<ProjectForm onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /remove video/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run tests/integration/projectForm.remove.test.jsx`
Expected: FAIL — no preview `<video>` / no Remove button.

- [ ] **Step 3: Edit `frontend/src/features/projects/components/ProjectForm.jsx`**

(a) Add removal state right after the existing `const [videoError, setVideoError] = useState('');` line:
```jsx
const [removeVideo, setRemoveVideo] = useState(false);
const hasExistingVideo = Boolean(project?.video?.url);
```

(b) In the `submit` function, add the two fields to the object passed to `onSubmit` (alongside `file` and `videoFile`):
```jsx
    removeVideo,
    currentVideoPath: project?.video?.path || null
```
So the `onSubmit({...})` call ends:
```jsx
    file: values.coverImage?.[0] || null,
    videoFile,
    removeVideo,
    currentVideoPath: project?.video?.path || null
  });
```

(c) Inside the "Demo video" `<div className="grid gap-1.5">` block, AFTER the hint `<p>` and the `{videoError ...}` line (still inside that div), add the preview/remove UI:
```jsx
{hasExistingVideo && !removeVideo ? (
  <div className="grid gap-2">
    <video
      controls
      preload="none"
      src={project.video.url}
      poster={project.coverImage?.url || undefined}
      className="aspect-video w-full rounded-md border border-border"
    />
    <button type="button" onClick={() => setRemoveVideo(true)} className="justify-self-start text-sm text-danger">
      Remove video
    </button>
  </div>
) : null}
{hasExistingVideo && removeVideo ? (
  <p className="text-sm text-muted">
    Video will be removed on save.{' '}
    <button type="button" onClick={() => setRemoveVideo(false)} className="text-accent underline">
      Undo
    </button>
  </p>
) : null}
```

Do not change other fields, the schema, or the cover-image block.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npx vitest run tests/integration/projectForm.remove.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the existing video form test (no regression)**

Run: `cd frontend && npx vitest run tests/integration/projectForm.video.test.jsx`
Expected: PASS (2 tests) — the upload input + size guard still work.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/projects/components/ProjectForm.jsx frontend/tests/integration/projectForm.remove.test.jsx
git commit -m "feat(projects): preview + remove control for project video"
```

---

### Task 4: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `cd frontend && npm test`
Expected: all tests pass (the suite was green at 27 tests before this work; the new tests add to that — 1 new in mappers, 3 in update, 2 in form remove).

- [ ] **Step 2: Production build**

Run: `cd frontend && npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 3: Manual smoke (needs migration applied + admin login)**

1. Edit a project that has a video → the form shows the inline preview + Remove button.
2. Click Remove → preview hides, "Video will be removed on save" appears with Undo; Undo restores the preview.
3. Remove + Save → detail page shows the cover image/gradient again; the old object is gone from the `project-videos` bucket.
4. Edit again, upload a different mp4 (replace) → Save → detail plays the new clip; the previous object is gone from the bucket.

---

## Notes

- `ProjectEditor.jsx` needs NO change — it already spreads the form payload into `mutation.mutate({ id, ...payload })`, so `removeVideo`/`currentVideoPath` flow through automatically.
- Storage-delete is best-effort; an orphan from a failed delete is acceptable (the DB row is the source of truth).
