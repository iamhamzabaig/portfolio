import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Lightweight toast system. Wrap the app in <ToastProvider>, then call
// `const { toast } = useToast()` and `toast({ tone, message })` (or `toast('text')`).
// Toasts auto-dismiss after `duration` ms and stack bottom-right (bottom-center on
// mobile). Announced via role="status" for screen readers.
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

const tones = {
  success: { icon: Check, cls: 'text-success' },
  error: { icon: AlertCircle, cls: 'text-danger' },
  info: { icon: Info, cls: 'text-info' }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (opts) => {
      const id = (idRef.current += 1);
      const item = {
        id,
        tone: 'info',
        duration: 4000,
        ...(typeof opts === 'string' ? { message: opts } : opts)
      };
      setToasts((list) => [...list, item]);
      if (item.duration) setTimeout(() => dismiss(id), item.duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastViewport toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { icon: Icon, cls } = tones[t.tone] || tones.info;
          return (
            <motion.div
              key={t.id}
              layout
              role="status"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-control border border-border bg-panel px-4 py-3 shadow-overlay"
            >
              <Icon aria-hidden="true" size={18} className={`shrink-0 ${cls}`} />
              <p className="text-body-sm text-ink">{t.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="ml-1 shrink-0 text-muted transition-colors hover:text-ink"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
