import { Component } from 'react';
import { Eyebrow } from './Eyebrow.jsx';

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
        <Eyebrow>Something broke</Eyebrow>
        <h1 className="mt-3 font-display text-fluid-h1 font-semibold text-ink">
          This page hit an error.
        </h1>
        <p className="mt-3 text-muted">
          It&apos;s been logged. Try again, or head back home.
        </p>
        {import.meta.env.DEV && (
          <pre className="mt-5 max-w-full overflow-auto rounded-xl border border-border bg-panel p-4 text-left text-caption text-danger">
            {String(error?.stack || error?.message || error)}
          </pre>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full bg-accent px-6 py-2.5 text-body-sm font-medium text-white transition hover:brightness-110"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full bg-surface px-6 py-2.5 text-body-sm font-medium text-ink transition hover:bg-border/60"
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}
