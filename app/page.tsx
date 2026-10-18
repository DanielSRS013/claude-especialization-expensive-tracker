"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CategoryBreakdown } from "@/components/charts/category-breakdown";
import { SpendingTrend } from "@/components/charts/spending-trend";
import { ExpenseFormModal } from "@/components/expense-form";
import { useExpenses } from "@/components/expense-store";
import { FilterBar } from "@/components/filter-bar";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { clampRange, summarize, totalsByCategory } from "@/lib/analytics";
import { getCategory } from "@/lib/categories";
import { applyFilters, describeRange, resolveRange, sortExpenses } from "@/lib/filters";
import { formatDate, formatMoney } from "@/lib/format";
import type { Expense } from "@/lib/types";

export default function DashboardPage() {
  const { ready, expenses, filters, loadSampleData } = useExpenses();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const filtered = useMemo(() => applyFilters(expenses, filters), [expenses, filters]);
  const summary = useMemo(() => summarize(expenses, filtered, filters), [expenses, filtered, filters]);
  const byCategory = useMemo(() => totalsByCategory(filtered), [filtered]);
  const recent = useMemo(() => sortExpenses(filtered, "date", "desc").slice(0, 5), [filtered]);
  // Month-to-date reads to today, not to the end of the month.
  const rangeLabel = describeRange(clampRange(resolveRange(filters)));

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-2">{rangeLabel}</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          + Add expense
        </Button>
      </div>

      <FilterBar />

      {!ready ? (
        <Card>
          <p className="py-16 text-center text-sm text-ink-2">Loading your expenses…</p>
        </Card>
      ) : expenses.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-lg font-medium text-ink">No expenses yet</p>
            <p className="max-w-sm text-sm text-ink-2">
              Add your first expense to start seeing totals, trends and category breakdowns — or
              load six months of sample data to explore the app.
            </p>
            <div className="flex gap-2">
              <Button variant="primary" onClick={openAdd}>
                + Add expense
              </Button>
              <Button onClick={loadSampleData}>Load sample data</Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Hero figure: the one number this view leads with. */}
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-ink-2 uppercase">
                  Total spending
                </p>
                <p className="mt-2 text-[2.75rem] leading-none font-semibold tracking-tight text-ink sm:text-5xl">
                  {formatMoney(summary.total)}
                </p>
                <p className="mt-3 text-sm text-ink-2">
                  {summary.count} {summary.count === 1 ? "expense" : "expenses"} over{" "}
                  {summary.dayCount} {summary.dayCount === 1 ? "day" : "days"} · {rangeLabel}
                </p>
              </div>
              {summary.changePercent !== null ? (
                <p className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className={summary.changePercent > 0 ? "text-critical" : "text-good-text"}
                  >
                    {summary.changePercent > 0 ? "▲" : "▼"}
                  </span>
                  <span
                    className={`font-medium ${
                      summary.changePercent > 0 ? "text-critical" : "text-good-text"
                    }`}
                  >
                    {Math.abs(Math.round(summary.changePercent))}%
                  </span>
                  <span className="text-ink-2">
                    vs {summary.previousLabel} ({formatMoney(summary.previousTotal)})
                  </span>
                </p>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Daily average"
              value={formatMoney(summary.dailyAverage)}
              note={`Across ${summary.dayCount} ${summary.dayCount === 1 ? "day" : "days"}`}
            />
            <StatTile
              label="Expenses logged"
              value={summary.count}
              note={filters.categories.length > 0 ? "In the selected categories" : "In this range"}
            />
            <StatTile
              label="Top category"
              value={
                summary.topCategory ? (
                  <span className="flex items-baseline gap-2">
                    <span aria-hidden="true" className="text-xl">
                      {summary.topCategory.icon}
                    </span>
                    <span className="truncate text-xl sm:text-2xl">
                      {summary.topCategory.label}
                    </span>
                  </span>
                ) : (
                  "—"
                )
              }
              note={
                summary.topCategory
                  ? `${formatMoney(summary.topCategory.total)} · ${Math.round(
                      summary.topCategory.share * 100,
                    )}% of total`
                  : undefined
              }
            />
            <StatTile
              label="Largest expense"
              value={summary.largest ? formatMoney(summary.largest.amount) : "—"}
              note={
                summary.largest
                  ? `${summary.largest.description} · ${formatDate(summary.largest.date)}`
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <SpendingTrend expenses={filtered} allExpenses={expenses} filters={filters} />
            <CategoryBreakdown rows={byCategory} />
          </div>

          <Card padded={false}>
            <div className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardHeader
                title="Recent activity"
                subtitle="The latest expenses in this range"
                action={
                  <Link
                    href="/expenses"
                    className="rounded-lg border border-hairline px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink"
                  >
                    View all
                  </Link>
                }
              />
            </div>
            {recent.length === 0 ? (
              <p className="px-6 pb-8 text-sm text-ink-2">Nothing matches the current filters.</p>
            ) : (
              <ul className="border-t border-hairline">
                {recent.map((expense) => {
                  const category = getCategory(expense.category);
                  return (
                    <li
                      key={expense.id}
                      className="flex items-center gap-4 border-b border-hairline px-5 py-3 last:border-0 sm:px-6"
                    >
                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-hairline bg-surface-2"
                      >
                        {category.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {expense.description}
                        </span>
                        <span className="block text-xs text-ink-2">
                          {category.label} · {formatDate(expense.date)}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-ink tabular-nums">
                        {formatMoney(expense.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      <ExpenseFormModal open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}
