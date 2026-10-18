"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader } from "./ui/card";
import { getCategory } from "@/lib/categories";
import { formatDate, formatMoney } from "@/lib/format";
import { sortExpenses } from "@/lib/filters";
import { sum } from "@/lib/analytics";
import type { Expense, SortDir, SortKey } from "@/lib/types";

const PAGE_SIZE = 25;

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "date", label: "Date", align: "left" },
  { key: "description", label: "Description", align: "left" },
  { key: "category", label: "Category", align: "left" },
  { key: "amount", label: "Amount", align: "right" },
];

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  emptyState,
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  emptyState?: React.ReactNode;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sorted = useMemo(
    () => sortExpenses(expenses, sortKey, sortDir),
    [expenses, sortKey, sortDir],
  );
  const rows = sorted.slice(0, visible);
  const total = useMemo(() => sum(expenses), [expenses]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
    setVisible(PAGE_SIZE);
  }

  return (
    <Card padded={false}>
      <div className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardHeader
          title="Expenses"
          subtitle={
            expenses.length === 0
              ? "Nothing matches the current filters"
              : `${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"} · ${formatMoney(total)} total`
          }
        />
      </div>

      {expenses.length === 0 ? (
        <div className="px-5 pb-8 sm:px-6">{emptyState}</div>
      ) : (
        <>
          {/* Table for pointer-friendly widths */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Filtered expenses</caption>
              <thead>
                <tr className="border-y border-hairline text-xs text-ink-2 uppercase">
                  {COLUMNS.map((column) => {
                    const active = sortKey === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        className={`px-6 py-2.5 font-medium ${
                          column.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className={`inline-flex items-center gap-1 transition hover:text-ink ${
                            active ? "text-ink" : ""
                          }`}
                        >
                          {column.label}
                          <span aria-hidden="true" className={active ? "" : "opacity-0"}>
                            {sortDir === "asc" ? "↑" : "↓"}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col" className="px-6 py-2.5 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((expense) => {
                  const category = getCategory(expense.category);
                  return (
                    <tr key={expense.id} className="group border-b border-hairline last:border-0">
                      <td className="px-6 py-3 whitespace-nowrap text-ink-2 tabular-nums">
                        {formatDate(expense.date)}
                      </td>
                      <td className="max-w-[22rem] px-6 py-3 text-ink">
                        <span className="block truncate">{expense.description}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-xs text-ink-2">
                          <span aria-hidden="true">{category.icon}</span>
                          {category.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-ink tabular-nums">
                        {formatMoney(expense.amount)}
                      </td>
                      <td className="px-6 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1 opacity-60 transition group-hover:opacity-100 focus-within:opacity-100">
                          <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(expense)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stacked cards on narrow screens */}
          <ul className="divide-y divide-[color:var(--border)] border-t border-hairline sm:hidden">
            {rows.map((expense) => {
              const category = getCategory(expense.category);
              return (
                <li key={expense.id} className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">
                      {expense.description}
                    </span>
                    <span className="font-semibold text-ink tabular-nums">
                      {formatMoney(expense.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-2">
                    <span>
                      <span aria-hidden="true" className="mr-1">
                        {category.icon}
                      </span>
                      {category.label} · {formatDate(expense.date)}
                    </span>
                    <span className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(expense)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(expense)}>
                        Delete
                      </Button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {visible < sorted.length ? (
            <div className="flex items-center justify-center gap-3 border-t border-hairline px-5 py-4 text-sm text-ink-2">
              <span>
                Showing {rows.length} of {sorted.length}
              </span>
              <Button size="sm" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                Show more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
