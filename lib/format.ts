const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const currencyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return currency.format(value);
}

/** Axis ticks and tiles: compact from 1,000 up (0 / $1K / $2K). */
export function formatMoneyCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return currencyWhole.format(value);
}

export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(Math.round(value))}%`;
}

/** `YYYY-MM-DD` for today, in the viewer's local calendar. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses `YYYY-MM-DD` as a local date, so no day ever shifts by a timezone. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return fromISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** `2026-03` -> `Mar 2026` */
export function formatMonthKey(key: string, opts: { short?: boolean } = {}): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: opts.short ? undefined : "numeric",
  });
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
