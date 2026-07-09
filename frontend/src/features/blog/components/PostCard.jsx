import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge.jsx';
import { formatDate } from '../../../utils/formatDate.js';

// Quiet gradient fallback when a post has no cover image, so the grid stays even.
function coverGradient(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${hash} 60% 55%), hsl(${(hash + 40) % 360} 60% 45%))`;
}

// Apple product-tile styling, shared with ProjectCard: generous rounding, quiet
// surface, cover zooms softly on hover. Reads a post's date + primary tag.
export function PostCard({ post }) {
  const hasImage = Boolean(post.coverImage?.url);
  const date = formatDate(post.publishedAt || post.createdAt);

  return (
    <div>
      <Link
        to={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card bg-panel shadow-soft ring-1 ring-border/70 transition duration-500 ease-apple hover:-translate-y-1.5 hover:shadow-lift"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface">
          {hasImage ? (
            <img
              src={post.coverImage.url}
              alt=""
              className="h-full w-full object-cover transition duration-700 ease-apple group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div
              className="h-full w-full transition duration-700 ease-apple group-hover:scale-[1.04]"
              style={{ backgroundImage: coverGradient(post.title) }}
            />
          )}
          {!post.published && (
            <div className="absolute left-4 top-4">
              <Badge tone="solid" size="xs">
                Draft
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center gap-2 text-caption text-muted">
            {date && <span>{date}</span>}
            {post.tags?.[0] && (
              <>
                {date && <span aria-hidden="true">·</span>}
                <span className="text-accent">{post.tags[0]}</span>
              </>
            )}
          </div>
          <h3 className="font-display text-fluid-h3 font-semibold text-ink">{post.title}</h3>
          <p className="line-clamp-2 text-body-sm text-muted">{post.excerpt}</p>
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-body-sm font-medium text-accent">
            Read
            <ArrowRight
              aria-hidden="true"
              size={16}
              className="transition-transform duration-300 ease-apple group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
