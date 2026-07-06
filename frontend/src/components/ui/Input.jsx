import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ id, label, error, className = '', ...props }, ref) {
  return (
    <div className="grid gap-2">
      {label ? (
        <label htmlFor={id} className="text-caption font-medium text-muted">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-12 rounded-control border border-border bg-surface px-4 text-body-sm text-ink outline-none transition duration-300 ease-apple placeholder:text-muted/70 focus:border-accent focus:bg-panel focus:shadow-glow ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-caption text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
