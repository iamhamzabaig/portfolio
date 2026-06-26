# Media Gallery, Private Flag & Screenshots — Design

**Date:** 2026-06-26
**Status:** Approved (design)
**Builds on:** the project demo-video features (2026-06-25, 2026-06-26).

## Problem

Four related enhancements to project presentation:
- **B.** The lazy video shows a static poster with no obvious "this is playable" affordance.
- **A.** Some projects can't expose a live URL or repo (NDA / private); the detail page should say so instead of just omitting the buttons.
- **C.** A project should support multiple screenshots, uploaded/managed in admin.
- **D.** The detail page's media area should become a slideshow combining the video and screenshots.

## Decisions (from brainstorming)

- Private = hide **only** Live/Source links and show an NDA notice; video/screenshots still shown.
- The slideshow **is the main media slot** (top of detail page); the video is one slide.
- Slideshow **auto-advances every 5s**, paused on hover and while the video is playing.
- **Max 8 screenshots** per project.
- Build order **B → A → C → D**; B is a reusable `VideoPlayer` that D composes (no rework).

## Shared DB migration

New migration `backend/supabase/migrations/<ts>_project_private_screenshots.sql` (applied by the user via `supabase db push`; reuses the existing `project-images` bucket and existing `projects` RLS — no new bucket/policies):

```sql
alter table public.projects
  add column if not exists is_private  boolean not null default false,
  add column if not exists screenshots jsonb   not null default '[]'::jsonb;
```

Screenshot objects live in the existing public `project-images` bucket (already has `is_admin()` write + public read policies).

---

## Feature B — `VideoPlayer` component (centered play overlay)

**File:** `frontend/src/features/projects/components/VideoPlayer.jsx`
**Props:** `{ src, poster, onPlayingChange }`

- Initial (not playing): render the poster as a background image plus a centered circular button — translucent `backdrop-blur` bg, lucide `Play` icon, `aria-label="Play video"`. No `<video>` element yet (stays lazy — bytes load only on click).
- On click: set `playing = true`, render `<video src autoPlay controls className=...>`, and call `onPlayingChange?.(true)`.
- Wire `onPlay → onPlayingChange(true)`, `onPause`/`onEnded → onPlayingChange(false)`.
- Used in `ProjectDetail` in place of the current inline `<video>` (interim; Feature D moves it into the gallery).

**Tests:** initial render shows the Play button and NO `<video>`; after clicking Play, a `<video>` with the correct `src` and `autoplay` is present.

---

## Feature A — Private / NDA flag

**DB:** `is_private` (above).

**API (`projects.api.js`):**
- `toProject` → add `isPrivate: Boolean(row.is_private)`.
- `toRow` → add `is_private: Boolean(values.isPrivate)` to the base row (always written, like `featured`).

**Admin (`ProjectForm.jsx`):**
- Add a checkbox "Private / under NDA" (same styling as the existing "Featured project" checkbox), registered as `isPrivate`, default from `project?.isPrivate`.
- Include `isPrivate: Boolean(values.isPrivate)` in the submitted `values`.

**Public (`ProjectDetail.jsx`):**
- When `project.isPrivate`: render a notice in place of the Live/Source button row — `🔒 Private — code & demo under NDA` (muted pill/text). When false: existing Live/Source buttons unchanged.

**Tests:** `toProject`/`toRow` map `isPrivate`; ProjectForm renders the checkbox and emits `isPrivate`; ProjectDetail shows the NDA notice and no Live/Source buttons when private.

---

## Feature C — Multiple screenshots (data + admin)

**DB:** `screenshots jsonb` (above).

**API (`projects.api.js`):**
- `toProject` → add `screenshots: Array.isArray(row.screenshots) ? row.screenshots.map((s) => ({ url: s.url ?? '', path: s.path ?? '' })) : []`.
- New helper `uploadScreenshot(file)` → `{ url, path }`, uploads to the `project-images` bucket (mirror `uploadCover`).
- `createProject`/`updateProject` accept `screenshotFiles` (array of File) and `removeScreenshotPaths` (array of storage paths to drop):
  - Upload each file in `screenshotFiles` → new `{url, path}` objects.
  - Final screenshots = `existingScreenshots` (passed from form) minus any whose `path` is in `removeScreenshotPaths`, plus the newly uploaded ones.
  - Write the resulting array to `row.screenshots`.
  - Best-effort delete removed objects: `supabase.storage.from('project-images').remove(removeScreenshotPaths).catch(() => {})` after a successful DB write.
- The form passes the current `screenshots` so the API can compute the final array (keeps the API stateless about prior rows).

**Admin (`ProjectForm.jsx`):**
- Thumbnail grid of existing `project.screenshots`, each with a small remove (✕) button that adds its `path` to a `removeScreenshotPaths` state set and hides the thumbnail.
- A multi-file input (`accept="image/*" multiple`) for new screenshots.
- **Cap 8:** `existing(after removals) + newly selected` must be ≤ 8; otherwise show an inline error and block submit.
- Submit payload adds `screenshotFiles` (array), `removeScreenshotPaths` (array), and `existingScreenshots` (the current array).

**Tests:** `toProject` maps `screenshots`; `updateProject` uploads new + removes selected (asserts final `screenshots` array + `storage.remove` called with removed paths); ProjectForm renders existing thumbnails + multi-input, enforces the 8 cap with an inline error.

---

## Feature D — `MediaGallery` (the media slot)

**File:** `frontend/src/features/projects/components/MediaGallery.jsx`
**Props:** `{ video, screenshots, coverImage, title }`

- Build `slides`: if `video?.url` → `[{ type: 'video', url: video.url }]`, then each screenshot → `{ type: 'image', url }`.
- **0 slides:** render the existing fallback — cover image if `coverImage?.url`, else the gradient-monogram block (reuse `coverGradient`/`monogram`). No carousel.
- **≥1 slide:** show the current slide — `video` → `<VideoPlayer src poster={coverImage?.url} onPlayingChange={setVideoPlaying} />`; `image` → `<img>`.
- **≥2 slides:** add prev/next chevron buttons (lucide `ChevronLeft`/`ChevronRight`, `aria-label`), dot indicators (one per slide, active highlighted, clickable), and auto-advance every 5000ms via `setInterval`. Pause the interval when hovered (`onMouseEnter`/`Leave`) OR when `videoPlaying` is true. Clear the interval on unmount and when paused.
- Replaces the media-block ternary in `ProjectDetail.jsx`.

**Tests:** with a video + 2 screenshots → 3 slides, 3 dots, next/prev change the shown slide; 0 slides → falls back to cover image/gradient (no carousel controls). (Auto-advance timing is covered by structure, not asserted on a real timer to keep tests fast/deterministic — use `vi.useFakeTimers()` for one advance tick.)

---

## Error handling

- All storage deletes (screenshots, video) are best-effort and never block the DB write.
- Upload/DB errors propagate through React Query mutations as today.
- Client-side caps/guards (8 screenshots, 50 MB video) run before upload.

## Out of scope (YAGNI)

- Screenshot reordering, captions, lightbox/fullscreen, swipe gestures.
- Per-screenshot alt text beyond empty `alt`.
- Changing the public grid card media (only a small "Private" chip is optional and deferred).
