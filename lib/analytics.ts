import { CATEGORIES, getCategory } from "./categories";
import { addDays, fromISODate, monthKey, toISODate } from "./format";
import { resolveRange, type Range } from "./filters";
import type { CategoryId, Expense, Filters } from "./types";

export function sum(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}

export type CategoryTotal = {
  id: CategoryId;
  label: string;
  icon: string;
  total: number;
  count: number;
  share: number;
};

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<CategoryId, { total: number; count: number }>();
  for (const expense of expenses) {
    const entry = totals.get(expense.category) ?? { total: 0, count: 0 };
    entry.total += expense.amount;
    entry.count += 1;
    totals.set(expense.category, entry);
  }
  const grand = sum(expenses);
  return CATEGORIES.map((category) => {
    const entry = totals.get(category.id) ?? { total: 0, count: 0 };
    return {
      id: category.id,
      label: category.label,
      icon: category.icon,
      total: entry.total,
      count: entry.count,
      share: grand > 0 ? entry.total / grand : 0,
    };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.total - a.total);
}

export type MonthTotal = { key: string; total: number; count: number };

/** Monthly totals over the trailing months, including months with no spending. */
export function monthlyTotals(
  expenses: Expense[],
  months: number,
  today = new Date(),
): MonthTotal[] {
  const buckets = new Map<string, { total: number; count: number }>();
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    buckets.set(toISODate(date).slice(0, 7), { total: 0, count: 0 });
  }
  for (const expense of expenses) {
    const bucket = buckets.get(monthKey(expense.date));
    if (!bucket) continue;
    bucket.total += expense.amount;
    bucket.count += 1;
  }
  return [...buckets.entries()].map(([key, value]) => ({ key, ...value }));
}

export type DayTotal = { date: string; total: number };

/**
 * Trims the end of a range to today, so a month-to-date window is never padded
 * with days that have not happened yet.
 */
export function clampRange(range: Range, today = new Date()): Range {
  const todayISO = toISODate(today);
  return {
    from: range.from,
    to: range.to === null ? null : range.to > todayISO ? todayISO : range.to,
  };
}

/** Daily totals across an inclusive range, including days with no spending. */
export function dailyTotals(expenses: Expense[], range: Range, today = new Date()): DayTotal[] {
  const clamped = clampRange(range, today);
  const dates = expenses.map((e) => e.date).sort();
  const from = clamped.from ?? dates[0];
  const to = clamped.to ?? dates[dates.length - 1];
  if (!from || !to || from > to) return [];

  const buckets = new Map<string, number>();
  for (let day = fromISODate(from); toISODate(day) <= to; day = addDays(day, 1)) {
    buckets.set(toISODate(day), 0);
    if (buckets.size > 400) break;
  }
  for (const expense of expenses) {
    if (!buckets.has(expense.date)) continue;
    buckets.set(expense.date, (buckets.get(expense.date) ?? 0) + expense.amount);
  }
  return [...buckets.entries()].map(([date, total]) => ({ date, total }));
}

export type Summary = {
  total: number;
  count: number;
  dayCount: number;
  dailyAverage: number;
  largest: Expense | null;
  topCategory: CategoryTotal | null;
  previousTotal: number;
  /** Percent change vs the preceding window of equal length; null when there is no baseline. */
  changePercent: number | null;
  previousLabel: string;
};

/** Length of an inclusive range in days, falling back to the span of the data. */
function spanInDays(range: Range, expenses: Expense[], today = new Date()): number {
  const dates = expenses.map((e) => e.date).sort();
  const from = range.from ?? dates[0];
  const to = range.to ?? dates[dates.length - 1] ?? toISODate(today);
  if (!from || !to) return 1;
  const ms = fromISODate(to).getTime() - fromISODate(from).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function summarize(
  all: Expense[],
  filtered: Expense[],
  filters: Filters,
  today = new Date(),
): Summary {
  // A month-to-date window counts only the days that have happened, so the
  // average and the baseline comparison stay like-for-like.
  const range = clampRange(resolveRange(filters, today), today);
  const days = spanInDays(range, filtered, today);

  // Compare against the window of the same length immediately before this one.
  let previousTotal = 0;
  let previousLabel = "previous period";
  let hasBaseline = false;
  if (range.from && range.to) {
    let prevFrom: string;
    let prevTo: string;
    if (filters.preset === "this-month") {
      // Month-to-date compares against the same calendar days of last month.
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const daysInLastMonth = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth() + 1,
        0,
      ).getDate();
      prevFrom = toISODate(lastMonth);
      prevTo = toISODate(
        new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth(),
          Math.min(today.getDate(), daysInLastMonth),
        ),
      );
      previousLabel = "the same days last month";
    } else {
      prevTo = toISODate(addDays(fromISODate(range.from), -1));
      prevFrom = toISODate(addDays(fromISODate(prevTo), -(days - 1)));
      previousLabel = `the previous ${days === 1 ? "day" : `${days} days`}`;
    }
    const previous = all.filter((e) => e.date >= prevFrom && e.date <= prevTo);
    previousTotal = sum(previous);
    hasBaseline = previous.length > 0;
  }

  const total = sum(filtered);
  const byCategory = totalsByCategory(filtered);
  const largest = filtered.reduce<Expense | null>(
    (max, e) => (max === null || e.amount > max.amount ? e : max),
    null,
  );

  return {
    total,
    count: filtered.length,
    dayCount: days,
    dailyAverage: total / days,
    largest,
    topCategory: byCategory[0] ?? null,
    previousTotal,
    changePercent:
      hasBaseline && previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : null,
    previousLabel,
  };
}

export function categoryLabel(id: CategoryId): string {
  return getCategory(id).label;
}
