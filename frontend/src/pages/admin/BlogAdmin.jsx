import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Dialog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useDeletePost, usePosts } from '../../features/blog/api/blog.queries.js';

export default function BlogAdmin() {
  const postsQuery = usePosts();
  const deletePost = useDeletePost();
  const posts = postsQuery.data || [];
  const [toDelete, setToDelete] = useState(null);

  if (postsQuery.isLoading && !postsQuery.data) return <Spinner />;

  const confirmDelete = () => {
    if (!toDelete) return;
    deletePost.mutate(toDelete._id, { onSuccess: () => setToDelete(null) });
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Blog</h1>
        <Button as={Link} to="/admin/blog/new">
          <Plus aria-hidden="true" size={17} />
          New
        </Button>
      </div>
      <div className="overflow-hidden rounded-card border border-border bg-panel">
        {posts.length ? (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post._id || post.slug} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    {post.title}
                    {!post.published && (
                      <Badge tone="accent" size="xs">
                        Draft
                      </Badge>
                    )}
                  </p>
                  <p className="text-caption text-muted">{post.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    to={`/admin/blog/${post._id}`}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Edit ${post.title}`}
                  >
                    <Edit3 aria-hidden="true" size={17} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={`Delete ${post.title}`}
                    onClick={() => setToDelete(post)}
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-muted">No posts yet.</p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deletePost.isPending}
        title="Delete post?"
        description={toDelete ? `“${toDelete.title}” will be permanently removed. This can’t be undone.` : ''}
      />
    </section>
  );
}
