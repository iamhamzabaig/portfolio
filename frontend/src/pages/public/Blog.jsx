import { useMemo, useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Eyebrow } from '../../components/ui/Eyebrow.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { PostCard } from '../../features/blog/components/PostCard.jsx';
import { usePosts } from '../../features/blog/api/blog.queries.js';
import { fallbackPosts } from '../../utils/fallbackData.js';

const ALL = 'All';

export default function Blog() {
  const [active, setActive] = useState(ALL);
  const postsQuery = usePosts();
  // Public view shows published posts only; drafts are admin-only (RLS filters
  // them for anon, and the fallback samples are all published).
  const posts = (postsQuery.data?.length ? postsQuery.data : fallbackPosts).filter(
    (post) => post.published !== false
  );

  // Filter pills derived from the posts' own tags (most-used first), so they
  // stay in sync as posts are written — no hardcoded categories.
  const filters = useMemo(() => {
    const counts = new Map();
    posts.forEach((post) => (post.tags || []).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
    const ordered = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
    return [ALL, ...ordered];
  }, [posts]);

  const filtered = useMemo(() => {
    if (active === ALL) return posts;
    return posts.filter((post) => (post.tags || []).includes(active));
  }, [posts, active]);

  return (
    <Container className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Writing</Eyebrow>
        <h1 className="mt-3 font-display text-fluid-h1 font-semibold text-ink">Notes & articles</h1>
        <p className="mt-5 text-body text-muted">
          Engineering write-ups on performance, real-time systems, AI integration, and shipping production frontends.
        </p>
      </div>

      {filters.length > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {filters.map((tag) => {
            const isActive = tag === active;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActive(tag)}
                className={`rounded-full px-3.5 py-1.5 text-caption font-medium ring-1 transition duration-300 ease-apple ${
                  isActive
                    ? 'bg-accent text-on-accent ring-accent'
                    : 'bg-panel text-muted ring-border/70 hover:text-ink hover:ring-border'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-12">
        {postsQuery.isLoading && !postsQuery.data ? (
          <Spinner label="Loading posts" />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post._id || post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No posts published yet.</p>
        )}
      </div>
    </Container>
  );
}
