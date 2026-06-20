import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  content: z.string().optional(),
  tags: z.string().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  featured: z.boolean().optional(),
  coverImage: z.any().optional()
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
      featured: Boolean(project?.featured)
    }
  });

  const submit = (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('content', values.content || '');
    formData.append('tags', values.tags || '');
    formData.append('liveUrl', values.liveUrl || '');
    formData.append('repoUrl', values.repoUrl || '');
    formData.append('featured', values.featured ? 'true' : 'false');
    const file = values.coverImage?.[0];
    if (file) formData.append('coverImage', file);
    onSubmit(formData);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <Input id="title" label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea id="description" label="Description" error={errors.description?.message} {...register('description')} />
      <Textarea id="content" label="Long-form content" {...register('content')} />
      <Input id="tags" label="Tags" placeholder="React, Express, MongoDB" {...register('tags')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="liveUrl" label="Live URL" {...register('liveUrl')} />
        <Input id="repoUrl" label="Repo URL" {...register('repoUrl')} />
      </div>
      <label className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('featured')} />
        Featured project
      </label>
      <div className="grid gap-1.5">
        <label htmlFor="coverImage" className="font-mono text-xs uppercase text-muted">
          Cover image
        </label>
        <input id="coverImage" type="file" accept="image/*" className="rounded-md border border-border bg-panel px-3 py-3 text-sm text-muted" {...register('coverImage')} />
      </div>
      <Button type="submit" disabled={isPending}>
        <Save aria-hidden="true" size={17} />
        {isPending ? 'Saving...' : 'Save project'}
      </Button>
    </form>
  );
}
