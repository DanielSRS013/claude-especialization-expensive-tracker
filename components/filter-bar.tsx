"use client";

import { Button } from "./ui/button";
import { Input, Select } from "./ui/field";
import { CATEGORIES } from "@/lib/categories";
import { countActiveFilters, PRESET_LABELS } from "@/lib/filters";
import { useExpenses } from "./expense-store";
import type { CategoryId, DateRangePreset } from "@/lib/types";

const PRESET_ORDER: DateRangePreset[] = [
  "this-month",
  "last-month",
  "last-7",
  "last-30",
  "last-90",
  "this-year",
  "all",
  "custom",
];

/** Filters live in one row above the content they filter. */
export function FilterBar({ children }: { children?: React.ReactNode }) {
  const { filters, setFilters, resetFilters } = useExpenses();
  const active = countActiveFilters(filters);

  function toggleCategory(id: CategoryId) {
    setFilters((current) => ({
      ...current,
      categories: current.categories.includes(id)
        ? current.categories.filter((value) => value !== id)
        : [...current.categories, id],
    }));
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="filter-preset">
          Date range
        </label>
        <Select
          id="filter-preset"
          className="h-10 w-auto min-w-40"
          value={filters.preset}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              preset: event.target.value as DateRangePreset,
            }))
          }
        >
          {PRESET_ORDER.map((preset) => (
            <option key={preset} value={preset}>
              {PRESET_LABELS[preset]}
            </option>
          ))}
        </Select>

        {filters.preset === "custom" ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="From date"
              className="h-10 w-auto"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) =>
                setFilters((current) => ({ ...current, from: event.target.value }))
              }
            />
            <span className="text-sm text-muted">to</span>
            <Input
              type="date"
              aria-label="To date"
              className="h-10 w-auto"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            />
          </div>
        ) : null}

        <div className="relative min-w-48 flex-1">
          <Input
            type="search"
            aria-label="Search descriptions"
            placeholder="Search description or category…"
            className="h-10 pl-9"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted"
          >
            ⌕
          </span>
        </div>

        {active > 0 ? (
          <Button variant="ghost" onClick={resetFilters}>
            Reset{active > 1 ? ` (${active})` : ""}
          </Button>
        ) : null}

        {children}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilters((current) => ({ ...current, categories: [] }))}
          aria-pressed={filters.categories.length === 0}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            filters.categories.length === 0
              ? "border-series bg-series text-white"
              : "border-hairline text-ink-2 hover:bg-surface-2 hover:text-ink"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((category) => {
          const on = filters.categories.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                on
                  ? "border-series bg-series text-white"
                  : "border-hairline text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span aria-hidden="true" className="mr-1">
                {category.icon}
              </span>
              {category.label}
            </button>
          );
        })}
      </div>

      {filters.preset === "custom" && filters.from && filters.to && filters.from > filters.to ? (
        <p className="text-xs text-critical" role="alert">
          The start date is after the end date, so nothing matches. Swap them to see results.
        </p>
      ) : null}
    </div>
  );
}
