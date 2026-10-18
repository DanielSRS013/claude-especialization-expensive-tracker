export type CategoryId =
  | "food"
  | "groceries"
  | "transport"
  | "housing"
  | "utilities"
  | "health"
  | "entertainment"
  | "shopping"
  | "other";

export type Expense = {
  id: string;
  /** ISO calendar date, `YYYY-MM-DD` (no time, no timezone). */
  date: string;
  /** Positive amount in the display currency. */
  amount: number;
  category: CategoryId;
  description: string;
  createdAt: string;
};

export type ExpenseDraft = Omit<Expense, "id" | "createdAt">;

export type DateRangePreset =
  | "all"
  | "this-month"
  | "last-month"
  | "last-7"
  | "last-30"
  | "last-90"
  | "this-year"
  | "custom";

export type Filters = {
  preset: DateRangePreset;
  /** Only meaningful when `preset` is `custom`. */
  from: string;
  to: string;
  categories: CategoryId[];
  search: string;
};

export type SortKey = "date" | "amount" | "category" | "description";
export type SortDir = "asc" | "desc";
