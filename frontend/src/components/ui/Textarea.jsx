import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea({ id, label, error, className = '', ...props }, ref) {
  return (
    <div className="grid gap-2">
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-muted">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        ref={ref}
        className={`min-h-32 resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-ink outline-none transition duration-300 ease-apple placeholder:text-muted/70 focus:border-accent focus:bg-panel focus:shadow-glow ${className}`}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
