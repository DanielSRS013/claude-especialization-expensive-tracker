import { toISODate } from "./format";
import { newId } from "./storage";
import type { CategoryId, Expense } from "./types";

type Template = {
  category: CategoryId;
  /** One of these is picked per occurrence, so the demo list is not repetitive. */
  descriptions: string[];
  min: number;
  max: number;
  /** Rough number of occurrences per month. */
  perMonth: number;
  /** Fixed day of the month, for recurring bills that land on a schedule. */
  day?: number;
};

const TEMPLATES: Template[] = [
  {
    category: "groceries",
    descriptions: ["Weekly grocery run", "Supermarket top-up", "Farmers market", "Corner shop"],
    min: 48,
    max: 132,
    perMonth: 4,
  },
  {
    category: "food",
    descriptions: ["Lunch out", "Takeaway", "Bakery", "Food truck"],
    min: 11,
    max: 28,
    perMonth: 5,
  },
  {
    category: "food",
    descriptions: ["Dinner with friends", "Birthday dinner", "Brunch"],
    min: 32,
    max: 86,
    perMonth: 1,
  },
  { category: "food", descriptions: ["Coffee", "Coffee with the team"], min: 3.5, max: 7.5, perMonth: 6 },
  { category: "transport", descriptions: ["Transit pass"], min: 62, max: 62, perMonth: 1, day: 2 },
  {
    category: "transport",
    descriptions: ["Rideshare", "Taxi home", "Fuel", "Parking"],
    min: 9,
    max: 34,
    perMonth: 2,
  },
  { category: "housing", descriptions: ["Rent"], min: 1450, max: 1450, perMonth: 1, day: 1 },
  { category: "utilities", descriptions: ["Electricity"], min: 54, max: 96, perMonth: 1, day: 10 },
  { category: "utilities", descriptions: ["Internet"], min: 60, max: 60, perMonth: 1, day: 5 },
  { category: "utilities", descriptions: ["Mobile plan"], min: 35, max: 35, perMonth: 1, day: 8 },
  {
    category: "health",
    descriptions: ["Pharmacy", "Dentist visit", "Vitamins"],
    min: 12,
    max: 48,
    perMonth: 1,
  },
  { category: "health", descriptions: ["Gym membership"], min: 39, max: 39, perMonth: 1, day: 4 },
  {
    category: "entertainment",
    descriptions: ["Streaming subscriptions"],
    min: 24,
    max: 24,
    perMonth: 1,
    day: 3,
  },
  {
    category: "entertainment",
    descriptions: ["Cinema tickets", "Concert tickets", "Board game night"],
    min: 16,
    max: 38,
    perMonth: 1,
  },
  {
    category: "shopping",
    descriptions: ["Clothing", "New running shoes", "Winter jacket"],
    min: 28,
    max: 145,
    perMonth: 1,
  },
  {
    category: "shopping",
    descriptions: ["Household goods", "Cleaning supplies", "Books"],
    min: 14,
    max: 62,
    perMonth: 2,
  },
  {
    category: "other",
    descriptions: ["Gift", "Charity donation", "Postage"],
    min: 20,
    max: 90,
    perMonth: 1,
  },
];

/** Deterministic pseudo-random generator, so the demo data looks the same on every seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds six months of plausible demo expenses ending today, so the dashboard
 * has something to show on a first visit.
 */
export function buildSampleExpenses(today = new Date(), months = 6): Expense[] {
  const random = mulberry32(20261018);
  const expenses: Expense[] = [];
  const todayISO = toISODate(today);

  for (let back = months - 1; back >= 0; back -= 1) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - back, 1);
    const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();

    for (const template of TEMPLATES) {
      const occurrences = Math.max(
        1,
        Math.round(template.perMonth * (0.75 + random() * 0.5)),
      );
      for (let i = 0; i < occurrences; i += 1) {
        const day = template.day
          ? Math.min(template.day, daysInMonth)
          : 1 + Math.floor(random() * daysInMonth);
        const date = toISODate(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
        if (date > todayISO) continue;
        const amount = template.min + random() * (template.max - template.min);
        const description =
          template.descriptions[Math.floor(random() * template.descriptions.length)];
        expenses.push({
          id: newId(),
          date,
          amount: Math.round(amount * 100) / 100,
          category: template.category,
          description,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}
