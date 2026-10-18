"use client";

import { useExpenses } from "./expense-store";

export function Toaster() {
  const { toasts, dismissToast } = useExpenses();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-2.5 text-sm text-ink shadow-[0_8px_24px_rgba(11,11,11,0.12)]"
        >
          <span>{toast.message}</span>
          {toast.undo ? (
            <button
              type="button"
              onClick={() => {
                toast.undo?.();
                dismissToast(toast.id);
              }}
              className="font-medium text-series underline decoration-series/40 underline-offset-2 hover:decoration-series"
            >
              Undo
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-muted transition hover:text-ink"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
