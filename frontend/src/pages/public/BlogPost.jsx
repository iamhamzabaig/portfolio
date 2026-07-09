import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/layout/Container.jsx';
import { Chip } from '../../components/ui/Chip.jsx';
import { Markdown } from '../../components/ui/Markdown.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { usePost } from '../../features/blog/api/blog.queries.js';
import { formatDate } from '../../utils/formatDate.js';

export default function BlogPost() {
  const { slug } = useParams();
  const postQuery = usePost(slug);
  const post = postQuery.data;

  if (postQuery.isLoading && !post) return <Spinner />;
  if (!post) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-fluid-h1 font-semibold text-ink">Post not found</h1>
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
      <Container className="py-16 text-center sm:py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-caption font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={15} /> All writing
        </Link>

        {(post.tags || []).length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {(post.tags || []).map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
        )}

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-fluid-h1 font-semibold text-ink">
          {post.title}
        </h1>
        {date && <p className="mt-5 text-caption text-muted">{date}</p>}
        {post.excerpt && <p className="mx-auto mt-6 max-w-2xl text-body-lg text-muted">{post.excerpt}</p>}
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
        <div className="mx-auto max-w-2xl">
          <Markdown>{post.content || post.excerpt}</Markdown>
        </div>
      </Container>
    </article>
  );
}
