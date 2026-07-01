import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { captureVideoFrame } from '../captureVideoFrame.js';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_SCREENSHOTS = 8;

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  content: z.string().optional(),
  tags: z.string().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  isLivePrivate: z.boolean().optional(),
  isRepoPrivate: z.boolean().optional(),
  coverImage: z.any().optional(),
  video: z.any().optional(),
  screenshots: z.any().optional()
});

export function ProjectForm({ project, onSubmit, isPending = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      content: project?.content || '',
      tags: project?.tags?.join(', ') || '',
      liveUrl: project?.liveUrl || '',
      repoUrl: project?.repoUrl || '',
      sortOrder: project?.sortOrder ?? 0,
      featured: Boolean(project?.featured),
      isLivePrivate: Boolean(project?.isLivePrivate),
      isRepoPrivate: Boolean(project?.isRepoPrivate)
    }
  });

  const [videoError, setVideoError] = useState('');
  const [removeVideo, setRemoveVideo] = useState(false);
  const hasExistingVideo = Boolean(project?.video?.url);
  const [removeShotPaths, setRemoveShotPaths] = useState([]);
  const [shotError, setShotError] = useState('');
  const existingShots = (project?.screenshots || []).filter((s) => !removeShotPaths.includes(s.path));

  const submit = async (values) => {
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
    const screenshotFiles = Array.from(values.screenshots || []);
    const keptShots = (project?.screenshots || []).filter((s) => !removeShotPaths.includes(s.path));
    if (keptShots.length + screenshotFiles.length > MAX_SCREENSHOTS) {
      setShotError(`Max ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }
    setShotError('');
    // No cover (uploaded or existing) but a new video is? Derive a cover from a
    // video frame. Best-effort: on failure fall back to gradient/monogram.
    let coverFile = values.coverImage?.[0] || null;
    if (!coverFile && videoFile && !project?.coverImage?.url) {
      coverFile = await captureVideoFrame(videoFile).catch(() => null);
    }
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
        sortOrder: Number(values.sortOrder) || 0,
        featured: Boolean(values.featured),
        isLivePrivate: Boolean(values.isLivePrivate),
        isRepoPrivate: Boolean(values.isRepoPrivate)
      },
      file: coverFile,
      videoFile,
      removeVideo,
      currentVideoPath: project?.video?.path || null,
      screenshotFiles,
      removeScreenshotPaths: removeShotPaths,
      existingScreenshots: project?.screenshots || []
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <Input id="title" label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea id="description" label="Description" error={errors.description?.message} {...register('description')} />
      <Textarea id="content" label="Long-form content" {...register('content')} />
      <Input id="tags" label="Tags" placeholder="React, Express, MongoDB" {...register('tags')} />
      <Input
        id="sortOrder"
        type="number"
        min="0"
        label="Order"
        placeholder="1"
        error={errors.sortOrder?.message}
        {...register('sortOrder')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="liveUrl" label="Live URL" {...register('liveUrl')} />
        <Input id="repoUrl" label="Repo URL" {...register('repoUrl')} />
      </div>
      <label className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('featured')} />
        Featured project
      </label>
      <label className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('isLivePrivate')} />
        Live link private / under NDA
      </label>
      <label className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('isRepoPrivate')} />
        Repo private / under NDA
      </label>
      <div className="grid gap-1.5">
        <label htmlFor="coverImage" className="font-mono text-xs uppercase text-muted">
          Cover image
        </label>
        <input id="coverImage" type="file" accept="image/*" className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('coverImage')} />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="video" className="font-mono text-xs uppercase text-muted">
          Demo video
        </label>
        <input id="video" type="file" accept="video/mp4,video/webm" className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('video')} />
        <p className="text-xs text-muted">MP4 or WebM, max 50 MB. Compress before upload.</p>
        {videoError ? <p role="alert" className="text-sm text-danger">{videoError}</p> : null}
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
      </div>
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
      {/* Sticky save bar keeps the primary action reachable in long forms. */}
      <div className="glass sticky bottom-2 z-10 mt-2 flex justify-end rounded-xl px-3 py-3">
        <Button type="submit" disabled={isPending}>
          <Save aria-hidden="true" size={17} />
          {isPending ? 'Saving...' : 'Save project'}
        </Button>
      </div>
    </form>
  );
}
