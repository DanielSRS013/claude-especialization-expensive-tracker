"use client";

import { useEffect, useRef } from "react";

/**
 * A focus-trapping dialog built on <dialog>, so Escape, the backdrop and
 * focus containment come from the platform rather than hand-rolled handlers.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-hairline bg-surface p-0 text-ink backdrop:bg-black/40 open:animate-[fade_120ms_ease-out]"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-ink-2">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mt-1 -mr-1 rounded-lg px-2 py-1 text-xl leading-none text-muted transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-series"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
