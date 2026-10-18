import type { ReactNode } from "react";
import { formatSignedPercent } from "@/lib/format";

/**
 * Stat tile: label · value · optional delta (signed, vs a named period) · note.
 * For spending, up is bad — so the arrow glyph and the word carry the direction
 * as well as the color.
 */
export function StatTile({
  label,
  value,
  note,
  delta,
  deltaPeriod,
  upIsGood = false,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  delta?: number | null;
  deltaPeriod?: string;
  upIsGood?: boolean;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const direction = hasDelta ? Math.sign(Math.round(delta)) : 0;
  const good = direction === 0 ? null : upIsGood ? direction > 0 : direction < 0;

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-4 sm:p-5">
      <p className="text-xs font-medium tracking-wide text-ink-2 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
        {value}
      </p>
      {hasDelta && deltaPeriod ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm">
          <span
            aria-hidden="true"
            className={good === null ? "text-muted" : good ? "text-good-text" : "text-critical"}
          >
            {direction > 0 ? "▲" : direction < 0 ? "▼" : "—"}
          </span>
          <span
            className={`font-medium ${
              good === null ? "text-ink-2" : good ? "text-good-text" : "text-critical"
            }`}
          >
            {formatSignedPercent(delta)}
          </span>
          <span className="text-ink-2">vs {deltaPeriod}</span>
        </p>
      ) : note ? (
        <p className="mt-2 truncate text-sm text-ink-2">{note}</p>
      ) : (
        <p className="mt-2 text-sm text-muted">—</p>
      )}
    </div>
  );
}
