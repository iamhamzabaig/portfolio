import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Renders a markdown string as an article body. Tailwind Typography (`prose`)
// gives sane defaults; the token overrides map it onto the site's theme colors
// so it stays consistent in light and dark. External links open in a new tab.
export function Markdown({ children, className = '' }) {
  return (
    <div
      className={`prose prose-neutral max-w-none dark:prose-invert
        prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-ink
        prose-p:text-muted prose-li:text-muted prose-strong:text-ink
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-ink prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-card prose-pre:bg-surface prose-pre:text-ink
        prose-img:rounded-media prose-blockquote:border-l-accent prose-blockquote:text-muted ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => <a target="_blank" rel="noreferrer" {...props} />
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}
