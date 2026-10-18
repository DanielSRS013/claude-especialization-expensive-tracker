import { getCategory } from "./categories";
import type { Expense } from "./types";

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Amount", "Category", "Description"];
  const rows = expenses.map((expense) => [
    expense.date,
    expense.amount.toFixed(2),
    getCategory(expense.category).label,
    expense.description,
  ]);
  return [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
