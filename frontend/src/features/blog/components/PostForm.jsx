import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  excerpt: z.string().min(10, 'A short excerpt is required'),
  content: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
  coverImage: z.any().optional()
});

export function PostForm({ post, onSubmit, isPending = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      tags: post?.tags?.join(', ') || '',
      published: Boolean(post?.published)
    }
  });

  const submit = (values) => {
    onSubmit({
      values: {
        title: values.title,
        excerpt: values.excerpt,
        content: values.content || '',
        tags: (values.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        published: Boolean(values.published)
      },
      file: values.coverImage?.[0] || null
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <Input id="title" label="Title" error={errors.title?.message} {...register('title')} />
      <Textarea id="excerpt" label="Excerpt" error={errors.excerpt?.message} {...register('excerpt')} />
      <Textarea
        id="content"
        label="Body (Markdown)"
        className="min-h-64 font-mono"
        placeholder={'## Heading\n\nWrite in **markdown** — headings, lists, `code`, [links](https://…), images.'}
        {...register('content')}
      />
      <Input id="tags" label="Tags" placeholder="Performance, React, AI" {...register('tags')} />
      <label className="flex items-center gap-2 rounded-control border border-border bg-panel px-3 py-3 text-body-sm text-muted">
        <input type="checkbox" className="h-4 w-4 accent-accent" {...register('published')} />
        Published (visible on the public site)
      </label>
      <div className="grid gap-1.5">
        <label htmlFor="coverImage" className="text-caption font-medium text-muted">
          Cover image
        </label>
        <input
          id="coverImage"
          type="file"
          accept="image/*"
          className="rounded-control border border-border bg-panel px-3 py-3 text-body-sm text-muted"
          {...register('coverImage')}
        />
        {post?.coverImage?.url ? (
          <img src={post.coverImage.url} alt="" className="mt-1 h-24 w-40 rounded-control border border-border object-cover" />
        ) : null}
      </div>
      <Button type="submit" loading={isPending}>
        {!isPending && <Save aria-hidden="true" size={17} />}
        {isPending ? 'Saving…' : 'Save post'}
      </Button>
    </form>
  );
}
