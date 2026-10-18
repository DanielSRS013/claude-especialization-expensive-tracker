import { CATEGORIES } from "./categories";
import { addDays, fromISODate, toISODate } from "./format";
import type { Expense, Filters, SortDir, SortKey } from "./types";

export const DEFAULT_FILTERS: Filters = {
  preset: "this-month",
  from: "",
  to: "",
  categories: [],
  search: "",
};

export const PRESET_LABELS: Record<Filters["preset"], string> = {
  all: "All time",
  "this-month": "This month",
  "last-month": "Last month",
  "last-7": "Last 7 days",
  "last-30": "Last 30 days",
  "last-90": "Last 90 days",
  "this-year": "This year",
  custom: "Custom range",
};

export type Range = { from: string | null; to: string | null };

/** Resolves a filter preset to an inclusive YYYY-MM-DD range. */
export function resolveRange(filters: Filters, today = new Date()): Range {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  switch (filters.preset) {
    case "all":
      return { from: null, to: null };
    case "this-month":
      return {
        from: toISODate(new Date(t.getFullYear(), t.getMonth(), 1)),
        to: toISODate(new Date(t.getFullYear(), t.getMonth() + 1, 0)),
      };
    case "last-month":
      return {
        from: toISODate(new Date(t.getFullYear(), t.getMonth() - 1, 1)),
        to: toISODate(new Date(t.getFullYear(), t.getMonth(), 0)),
      };
    case "last-7":
      return { from: toISODate(addDays(t, -6)), to: toISODate(t) };
    case "last-30":
      return { from: toISODate(addDays(t, -29)), to: toISODate(t) };
    case "last-90":
      return { from: toISODate(addDays(t, -89)), to: toISODate(t) };
    case "this-year":
      return {
        from: toISODate(new Date(t.getFullYear(), 0, 1)),
        to: toISODate(new Date(t.getFullYear(), 11, 31)),
      };
    case "custom":
      return { from: filters.from || null, to: filters.to || null };
  }
}

export function describeRange(range: Range): string {
  if (!range.from && !range.to) return "All time";
  const fmt = (iso: string) =>
    fromISODate(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (range.from && range.to) return `${fmt(range.from)} – ${fmt(range.to)}`;
  if (range.from) return `From ${fmt(range.from)}`;
  return `Until ${fmt(range.to as string)}`;
}

export function applyFilters(
  expenses: Expense[],
  filters: Filters,
  today = new Date(),
): Expense[] {
  const range = resolveRange(filters, today);
  const selected = new Set(filters.categories);
  const needle = filters.search.trim().toLowerCase();
  const labels = new Map(CATEGORIES.map((c) => [c.id, c.label.toLowerCase()]));

  return expenses.filter((expense) => {
    if (range.from && expense.date < range.from) return false;
    if (range.to && expense.date > range.to) return false;
    if (selected.size > 0 && !selected.has(expense.category)) return false;
    if (needle) {
      const haystack = `${expense.description} ${labels.get(expense.category) ?? ""}`;
      if (!haystack.toLowerCase().includes(needle)) return false;
    }
    return true;
  });
}

export function sortExpenses(expenses: Expense[], key: SortKey, dir: SortDir): Expense[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...expenses].sort((a, b) => {
    let delta = 0;
    switch (key) {
      case "date":
        delta = a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        break;
      case "amount":
        delta = a.amount - b.amount;
        break;
      case "category":
        delta = a.category.localeCompare(b.category);
        break;
      case "description":
        delta = a.description.localeCompare(b.description);
        break;
    }
    if (delta === 0) delta = a.id.localeCompare(b.id);
    return delta * factor;
  });
}

export function countActiveFilters(filters: Filters): number {
  let n = 0;
  if (filters.preset !== DEFAULT_FILTERS.preset) n += 1;
  if (filters.categories.length > 0) n += 1;
  if (filters.search.trim()) n += 1;
  return n;
}
