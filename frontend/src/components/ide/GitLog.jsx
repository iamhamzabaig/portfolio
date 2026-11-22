import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate.js';

// A stable fake commit hash for a slug, so posts read like `git log --oneline`.
export const shortHash = (text) =>
  [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16).padStart(7, '0').slice(0, 7);

export function GitLog({ posts, showTags = false }) {
  return (
    <ul className="overflow-hidden rounded-card bg-panel font-mono ring-1 ring-border">
      {posts.map((post) => (
        <li key={post._id || post.slug} className="border-b border-border last:border-b-0">
          <Link
            to={`/blog/${post.slug}`}
            className="group flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-surface sm:flex-row sm:items-baseline sm:gap-5"
          >
            <span className="shrink-0 text-caption syn-number">{shortHash(post.slug)}</span>
            <span className="shrink-0 text-caption text-muted">{formatDate(post.publishedAt || post.createdAt)}</span>
            <span className="min-w-0">
              <span className="text-body text-ink group-hover:text-accent">{post.title}</span>
              {showTags && (post.tags || []).length > 0 && (
                <span className="ml-2 text-caption syn-type">({post.tags.join(', ')})</span>
              )}
              {showTags && post.excerpt && <span className="mt-1 block text-caption text-muted">{post.excerpt}</span>}
            </span>
            <ArrowUpRight aria-hidden="true" size={16} className="ml-auto hidden shrink-0 text-muted group-hover:text-accent sm:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
