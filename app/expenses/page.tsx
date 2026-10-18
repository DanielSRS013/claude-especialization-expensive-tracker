"use client";

import { useMemo, useState } from "react";
import { ExpenseFormModal } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { useExpenses } from "@/components/expense-store";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { applyFilters, describeRange, resolveRange, sortExpenses } from "@/lib/filters";
import { downloadCsv, expensesToCsv } from "@/lib/csv";
import { todayISO } from "@/lib/format";
import type { Expense } from "@/lib/types";

export default function ExpensesPage() {
  const { ready, expenses, filters, resetFilters, removeExpense, loadSampleData, clearAll } =
    useExpenses();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const filtered = useMemo(() => applyFilters(expenses, filters), [expenses, filters]);
  const rangeLabel = describeRange(resolveRange(filters));

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  function exportCsv() {
    const rows = sortExpenses(filtered, "date", "desc");
    downloadCsv(`expenses-${todayISO()}.csv`, expensesToCsv(rows));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Expenses</h1>
          <p className="mt-1 text-sm text-ink-2">{rangeLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportCsv} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={openAdd}>
            + Add expense
          </Button>
        </div>
      </div>

      <FilterBar />

      {!ready ? (
        <Card>
          <p className="py-16 text-center text-sm text-ink-2">Loading your expenses…</p>
        </Card>
      ) : (
        <ExpenseList
          expenses={filtered}
          onEdit={openEdit}
          onDelete={(expense) => removeExpense(expense.id)}
          emptyState={
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-sm text-ink-2">
                {expenses.length === 0
                  ? "You have not recorded any expenses yet."
                  : "No expenses match the current filters."}
              </p>
              <div className="flex gap-2">
                <Button variant="primary" onClick={openAdd}>
                  + Add expense
                </Button>
                {expenses.length === 0 ? (
                  <Button onClick={loadSampleData}>Load sample data</Button>
                ) : (
                  <Button onClick={resetFilters}>Reset filters</Button>
                )}
              </div>
            </div>
          }
        />
      )}

      {ready && expenses.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface px-5 py-4 text-sm">
          <p className="text-ink-2">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} stored in this
            browser.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={loadSampleData}>
              Reload sample data
            </Button>
            <Button size="sm" variant="danger" onClick={clearAll}>
              Delete all
            </Button>
          </div>
        </div>
      ) : null}

      <ExpenseFormModal open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}
