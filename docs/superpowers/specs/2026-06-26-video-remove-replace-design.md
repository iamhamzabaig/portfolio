# Video Remove / Replace Edit Control — Design

**Date:** 2026-06-26
**Status:** Approved (design)
**Builds on:** 2026-06-25-project-demo-videos-design.md

## Problem

The demo-video feature lets an admin upload a video, but offers no way to
**remove** an existing video, and no UI affordance when **replacing** one.
"Replace" technically works (a new upload overwrites `video_url`/`video_path`)
but the form never shows that a video already exists, and the old storage object
is left orphaned in the bucket.

## Decision

Add an inline preview + Remove control to the edit form, and make `updateProject`
able to clear the video columns. On both remove and replace, delete the old
storage object (best-effort — a failed delete never blocks the DB update, since
the DB row is the source of truth). This keeps the free-tier storage quota clean.

## Architecture

### 1. API layer (`frontend/src/features/projects/api/projects.api.js`)

**`toProject`** — expose the storage path alongside the url (needed to delete the
old object):
```js
video: { url: row.video_url ?? '', path: row.video_path ?? '' }
```
Additive; existing `video.url` consumers are unaffected.

**`updateProject`** — new signature
`{ id, values, file, videoFile, removeVideo, currentVideoPath }`:
```js
export async function updateProject({ id, values, file, videoFile, removeVideo, currentVideoPath }) {
  const cover = file ? await uploadCover(file) : null;
  const row = toRow(values, cover, null); // base row; video columns untouched
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
- **Precedence:** a new upload (`videoFile`) wins over `removeVideo` — uploading
  means replace, not clear.
- **Best-effort cleanup:** the old object is removed only after a successful DB
  update; a storage-delete failure is swallowed (`.catch(() => {})`).
- `createProject` is unchanged (a new project has no prior video).

`toRow` is unchanged — passing `null` as its `video` arg means "leave video
columns untouched", which is exactly the base-row behavior `updateProject` needs
before it conditionally sets/clears them.

### 2. Form (`frontend/src/features/projects/components/ProjectForm.jsx`)

- Track removal intent: `const [removeVideo, setRemoveVideo] = useState(false);`
- `const hasExistingVideo = Boolean(project?.video?.url);`
- Render, inside the existing "Demo video" block:
  - When `hasExistingVideo && !removeVideo`: an inline lazy preview plus a Remove
    button:
    ```jsx
    <video controls preload="none" src={project.video.url} poster={project.coverImage?.url || undefined} className="aspect-video w-full rounded-md border border-border" />
    <button type="button" onClick={() => setRemoveVideo(true)} className="text-sm text-danger">Remove video</button>
    ```
  - When `removeVideo`: a notice + undo:
    ```jsx
    <p className="text-sm text-muted">Video will be removed on save. <button type="button" onClick={() => setRemoveVideo(false)} className="text-accent underline">Undo</button></p>
    ```
- The upload `<input type="file">` stays (uploading = replace).
- Submit payload gains two fields:
  ```js
  removeVideo,
  currentVideoPath: project?.video?.path || null
  ```
- `ProjectEditor` already spreads the payload into `mutation.mutate({ id, ...payload })`
  — no change needed there.

### 3. Error handling

- Storage-delete failure is swallowed (orphan acceptable at portfolio scale).
- Upload and DB errors propagate through the React Query mutation as today.
- The existing client-side size/type guard runs only when a new file is chosen;
  removal needs no guard.

## Testing

- `toProject` exposes `video.path` (extend the existing mappers unit test).
- `updateProject` (mocked supabase):
  - remove (`removeVideo: true`, `currentVideoPath` set, no file) → update row has
    `video_url: null` and `video_path: null`, and `storage.remove(['old/path'])`
    is called.
  - replace (`videoFile` set, `currentVideoPath` set) → update row has the new
    url/path, and `storage.remove(['old/path'])` is called.
  - no change (no file, `removeVideo` false) → update row has no `video_url`/
    `video_path` keys, and `storage.remove` is NOT called.
- `ProjectForm` (integration):
  - editing a project that has a video → shows the preview `<video>` and a Remove
    button; clicking Remove then saving puts `removeVideo: true` in the payload.
  - a new project (no video) → renders neither preview nor Remove button.

## Out of scope (YAGNI)

- Confirmation dialog before remove.
- Retry/queue for a failed storage delete.
- Multiple videos per project.
- Showing the preview anywhere other than the edit form.
