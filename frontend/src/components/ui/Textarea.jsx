import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea({ id, label, error, className = '', ...props }, ref) {
  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={id} className="font-mono text-xs uppercase text-muted">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        ref={ref}
        className={`min-h-32 resize-y rounded-md border border-border bg-panel px-3 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-accent ${className}`}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
