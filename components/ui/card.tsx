import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-hairline bg-surface shadow-[0_1px_2px_rgba(11,11,11,0.04)] ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
