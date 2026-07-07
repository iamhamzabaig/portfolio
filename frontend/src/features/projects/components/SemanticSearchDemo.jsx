import { useDeferredValue, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Eyebrow } from '../../../components/ui/Eyebrow.jsx';
import { aiAssistantCorpus } from '../../../utils/fallbackData.js';

// A genuinely-computed, in-browser retrieval demo — no backend, no LLM. It ranks
// the corpus by TF-IDF cosine similarity, the same relevance signal a real
// vector search leans on, so the "semantic search" claim is something you can
// actually poke at. Everything below runs client-side on each keystroke.

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'is', 'are', 'it', 'with', 'you',
  'your', 'can', 'be', 'how', 'do', 'does', 'this', 'that', 'at', 'as', 'by', 'from', 'per', 'not',
  'i', 'my', 'we', 'they', 'them', 'so', 'if', 'no', 'up'
]);

const tokenize = (text) =>
  (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length >= 2 && !STOP.has(w));

const norm = (vec) => Math.sqrt(Object.values(vec).reduce((sum, w) => sum + w * w, 0));

// Precompute the corpus once: IDF per term, then a weighted vector per document.
function buildIndex(corpus) {
  const docs = corpus.map((doc) => ({ ...doc, terms: tokenize(`${doc.title} ${doc.text}`) }));
  const N = docs.length;
  const df = new Map();
  docs.forEach((doc) => {
    new Set(doc.terms).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  });
  const idf = (t) => Math.log(1 + N / (1 + (df.get(t) || 0)));

  const vectors = docs.map((doc) => {
    const tf = {};
    doc.terms.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
    const vec = {};
    Object.entries(tf).forEach(([t, count]) => (vec[t] = count * idf(t)));
    return { doc, vec, norm: norm(vec) || 1 };
  });

  return { vectors, idf };
}

function rank(query, index) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const qtf = {};
  qTokens.forEach((t) => (qtf[t] = (qtf[t] || 0) + 1));
  const qvec = {};
  Object.entries(qtf).forEach(([t, count]) => (qvec[t] = count * index.idf(t)));
  const qNorm = norm(qvec) || 1;

  return index.vectors
    .map(({ doc, vec, norm: dNorm }) => {
      let dot = 0;
      for (const [t, w] of Object.entries(qvec)) if (vec[t]) dot += w * vec[t];
      return { doc, score: dot / (qNorm * dNorm) };
    })
    .filter((r) => r.score > 0.0001)
    .sort((a, b) => b.score - a.score);
}

// Highlight query terms (whole words) within a snippet.
function Highlight({ text, terms }) {
  if (!terms.length) return text;
  const re = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
      <mark key={i} className="rounded bg-accent/15 px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const EXAMPLES = ['how are answers grounded?', 'billing and plans', 'api rate limits', 'self-hosted deployment'];

export function SemanticSearchDemo() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const index = useMemo(() => buildIndex(aiAssistantCorpus), []);
  const results = useMemo(() => rank(deferred, index), [deferred, index]);
  const queryTerms = useMemo(() => tokenize(deferred), [deferred]);
  const topScore = results[0]?.score || 1;
  const hasQuery = Boolean(deferred.trim());

  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-6">
        <Eyebrow>Try it — live</Eyebrow>
        <h2 className="mt-3 font-display text-fluid-h3 font-semibold text-ink">Retrieval, running in your browser</h2>
        <p className="mt-3 text-body-sm text-muted">
          Type a question against a sample knowledge base. Results are ranked by TF-IDF cosine
          similarity — computed client-side on every keystroke, the same relevance signal a real
          vector search uses. No backend, no model call.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-control border border-border bg-panel px-4 transition focus-within:border-accent focus-within:shadow-glow">
          <Search aria-hidden="true" size={18} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. how is my data kept private?"
            aria-label="Search the sample knowledge base"
            className="h-12 w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-muted/70"
          />
        </div>

        {!hasQuery && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border border-border/70 bg-panel px-3 py-1 text-caption text-muted transition hover:border-border hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {hasQuery && (
          <div className="mt-6 space-y-3">
            {results.length === 0 ? (
              <p className="rounded-card border border-border/70 bg-panel px-4 py-6 text-center text-body-sm text-muted">
                No documents matched. Try different words.
              </p>
            ) : (
              results.map(({ doc, score }, i) => (
                <article
                  key={doc.id}
                  className="rounded-card border border-border/70 bg-panel p-4 shadow-soft"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-body font-semibold tracking-tight text-ink">{doc.title}</h3>
                    <span className="shrink-0 font-mono text-[11px] text-muted">{score.toFixed(3)}</span>
                  </div>
                  {/* Relevance bar — score relative to the top hit. */}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-300 ease-apple"
                      style={{ width: `${Math.max(6, (score / topScore) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-body-sm text-muted">
                    <Highlight text={doc.text} terms={queryTerms} />
                  </p>
                  {i === 0 && (
                    <p className="mt-2 font-mono text-[11px] text-accent">top match · rank #1</p>
                  )}
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
