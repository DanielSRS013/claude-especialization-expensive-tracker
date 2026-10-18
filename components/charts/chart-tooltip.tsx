"use client";

import { formatMoney } from "@/lib/format";

type Payload = { value?: number | string }[];

/** Shared tooltip body: a colored key beside text tokens, never colored text. */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
}: {
  active?: boolean;
  payload?: Payload;
  label?: string | number;
  labelFormatter?: (value: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0]?.value;
  const value = typeof raw === "number" ? raw : Number(raw ?? 0);
  const title = labelFormatter ? labelFormatter(String(label ?? "")) : String(label ?? "");

  return (
    <div className="rounded-xl border border-hairline bg-surface px-3 py-2 text-sm shadow-[0_8px_24px_rgba(11,11,11,0.12)]">
      <p className="text-xs text-ink-2">{title}</p>
      <p className="mt-1 flex items-center gap-2 font-medium text-ink">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: "var(--series-1)" }}
        />
        {formatMoney(value)}
      </p>
    </div>
  );
}
