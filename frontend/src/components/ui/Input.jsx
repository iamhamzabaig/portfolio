import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ id, label, error, className = '', ...props }, ref) {
  return (
    <div className="grid gap-2">
      {label ? (
        <label htmlFor={id} className="text-[13px] font-medium text-muted">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        ref={ref}
        className={`min-h-12 rounded-2xl border border-border bg-surface px-4 text-[15px] text-ink outline-none transition duration-300 ease-apple placeholder:text-muted/70 focus:border-accent focus:bg-panel focus:shadow-glow ${className}`}
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
