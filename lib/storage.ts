import { CATEGORIES } from "./categories";
import type { CategoryId, Expense } from "./types";

export const STORAGE_KEY = "expense-tracker:expenses:v1";
export const SEEDED_KEY = "expense-tracker:seeded:v1";

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

function isExpense(value: unknown): value is Expense {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
    typeof row.amount === "number" &&
    Number.isFinite(row.amount) &&
    typeof row.category === "string" &&
    VALID_CATEGORIES.has(row.category) &&
    typeof row.description === "string"
  );
}

/** Reads the stored expenses, discarding anything that is not a well-formed row. */
export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isExpense).map((expense) => ({
      ...expense,
      category: expense.category as CategoryId,
      createdAt: expense.createdAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    // Storage can be unavailable (private mode, blocked site data) — the app
    // still works for the session, it just will not persist.
  }
}

export function hasSeeded(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEEDED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    // ignored, see saveExpenses
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `e_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
