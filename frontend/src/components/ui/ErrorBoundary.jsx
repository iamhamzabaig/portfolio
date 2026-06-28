import { Component } from 'react';

// App-level safety net. Without this, any render-time throw (e.g. a malformed
// project row) unmounts the whole React tree and the user sees a blank page.
// Here we catch it, log it, and show a recoverable fallback instead.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-xs tracking-eyebrow text-accent">SOMETHING BROKE</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          This page hit an error.
        </h1>
        <p className="mt-3 text-muted">
          It&apos;s been logged. Try again, or head back home.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-5 max-w-full overflow-auto rounded-xl border border-border bg-panel p-4 text-left text-xs text-danger">
            {String(error?.stack || error?.message || error)}
          </pre>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full border border-accent bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#6d5fed]"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border bg-transparent px-5 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-white"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
