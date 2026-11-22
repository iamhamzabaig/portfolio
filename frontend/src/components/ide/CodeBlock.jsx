// Renders authored code with syntax colors and a line-number gutter. Each line
// is an array of [kind, text] tokens (kind: keyword, string, fn, number,
// comment, type, plain). No highlighter dependency: the content is ours.
export function CodeBlock({ file, lines, className = '' }) {
  return (
    <figure className={`overflow-hidden rounded-card bg-panel ring-1 ring-border ${className}`}>
      {file && (
        <figcaption className="border-b border-border px-4 py-2 font-mono text-caption text-muted">{file}</figcaption>
      )}
      <pre className="code-lines overflow-x-auto py-4 pr-4 text-body-sm">
        {lines.map((tokens, i) => (
          <div key={i}>
            <span>
              {tokens.length ? tokens.map(([kind, text], j) => <span key={j} className={`syn-${kind}`}>{text}</span>) : ' '}
            </span>
          </div>
        ))}
      </pre>
    </figure>
  );
}

// A section heading styled as a markdown heading under a file-path comment.
export function SectionTitle({ file, as: Tag = 'h2', className = '', children }) {
  return (
    <div className={className}>
      {file && <p className="font-mono text-caption syn-comment">{`// ${file}`}</p>}
      <Tag className="display mt-3 text-[clamp(2.25rem,5vw,4.25rem)] text-ink">
        <span aria-hidden="true" className="syn-keyword">{Tag === 'h1' ? '# ' : '## '}</span>
        {children}
      </Tag>
    </div>
  );
}
