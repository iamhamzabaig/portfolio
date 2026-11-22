import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Markdown } from '../../components/ui/Markdown.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { usePost } from '../../features/blog/api/blog.queries.js';
import { formatDate } from '../../utils/formatDate.js';
import { SectionTitle } from '../../components/ide/CodeBlock.jsx';
import { shortHash } from '../../components/ide/GitLog.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const postQuery = usePost(slug);
  const post = postQuery.data;

  if (postQuery.isLoading && !post) return <Spinner />;
  if (!post) {
    return (
      <Container className="py-32 text-center">
        <h1 data-motion="heading" className="font-display text-fluid-h1 font-semibold text-ink">Post not found</h1>
        <Link
          to="/blog"
          className="mt-5 inline-block text-body font-medium text-accent hover:underline underline-offset-4"
        >
          Back to writing ›
        </Link>
      </Container>
    );
  }

  const date = formatDate(post.publishedAt || post.createdAt);

  return (
    <article>
      {/* Centered article header. */}
      <Container className="py-16 sm:py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-caption font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={15} /> cd ../blog
        </Link>

        <SectionTitle as="h1" file={`blog/${post.slug}.md`} className="mt-8 max-w-4xl">
          {post.title}
        </SectionTitle>
        <p className="mt-5 font-mono text-caption text-muted">
          <span className="syn-keyword">commit</span> <span className="syn-number">{shortHash(post.slug)}</span>
          {date && <> · {date}</>}
        </p>

        {(post.tags || []).length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(post.tags || []).map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        {post.excerpt && <p className="mt-6 max-w-2xl border-l-2 border-border pl-4 text-body-lg text-muted">{post.excerpt}</p>}
      </Container>

      {/* Optional cover, framed on a soft gray band like the project galleries. */}
      {post.coverImage?.url && (
        <section className="bg-surface py-16 sm:py-20">
          <Container>
            <img
              src={post.coverImage.url}
              alt=""
              className="mx-auto max-h-[32rem] w-full rounded-media object-cover"
            />
          </Container>
        </section>
      )}

      {/* Readable markdown column. */}
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <Markdown>{post.content || post.excerpt}</Markdown>
        </div>
      </Container>
    </article>
  );
}
