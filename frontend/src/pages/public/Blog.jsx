import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../../components/layout/Container.jsx';
import { SectionTitle } from '../../components/ide/CodeBlock.jsx';
import { GitLog } from '../../components/ide/GitLog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
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
      <div className="max-w-2xl">
        <SectionTitle as="h1" file="git log --oneline blog/">Notes &amp; articles</SectionTitle>
        <p className="mt-5 text-body text-muted">
          Engineering write-ups on performance, real-time systems, AI integration, and shipping production frontends.
        </p>
      </div>

      {filters.length > 1 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="mono mr-1 text-caption text-muted"><span className="syn-keyword">grep</span> --tag=</span>
          {filters.map((tag) => {
            const isActive = tag === active;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActive(tag)}
                aria-pressed={isActive}
                className={`spring-press relative rounded-control px-3 py-1.5 font-mono text-caption font-medium ring-1 ${
                  isActive ? 'text-on-accent ring-transparent' : 'bg-panel text-muted ring-border/70 hover:text-ink hover:ring-border'
                }`}
              >
                {isActive && (
                  <motion.span layoutId="blog-chip" className="absolute inset-0 rounded-control bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{tag}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-12">
        {postsQuery.isLoading && !postsQuery.data ? (
          <Spinner label="Loading posts" />
        ) : filtered.length ? (
          <GitLog posts={filtered} showTags />
        ) : (
          <p className="font-mono text-muted">fatal: no commits yet.</p>
        )}
      </div>
    </Container>
  );
}
