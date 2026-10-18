import type { CategoryId } from "./types";

export type Category = {
  id: CategoryId;
  label: string;
  /** Identity is carried by icon + label, never by color alone. */
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food & dining", icon: "🍽️" },
  { id: "groceries", label: "Groceries", icon: "🛒" },
  { id: "transport", label: "Transport", icon: "🚆" },
  { id: "housing", label: "Housing & rent", icon: "🏠" },
  { id: "utilities", label: "Utilities", icon: "💡" },
  { id: "health", label: "Health", icon: "🩺" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "other", label: "Other", icon: "•" },
];

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  return BY_ID.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}
