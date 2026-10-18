"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Field, Input, Select } from "./ui/field";
import { Modal } from "./ui/modal";
import { CATEGORIES } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import { useExpenses } from "./expense-store";
import type { CategoryId, Expense } from "@/lib/types";

type FormState = { date: string; amount: string; category: CategoryId; description: string };
type Errors = Partial<Record<keyof FormState, string>>;

function emptyForm(): FormState {
  return { date: todayISO(), amount: "", category: "food", description: "" };
}

function toForm(expense: Expense): FormState {
  return {
    date: expense.date,
    amount: expense.amount.toFixed(2),
    category: expense.category,
    description: expense.description,
  };
}

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.date) errors.date = "Pick a date.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errors.date = "Use the format YYYY-MM-DD.";
  else if (form.date > todayISO()) errors.date = "The date cannot be in the future.";

  const amount = Number(form.amount.replace(",", "."));
  if (!form.amount.trim()) errors.amount = "Enter an amount.";
  else if (!Number.isFinite(amount)) errors.amount = "Amounts must be a number.";
  else if (amount <= 0) errors.amount = "Amounts must be greater than zero.";
  else if (amount > 1_000_000) errors.amount = "That looks too large — check the amount.";

  if (!form.description.trim()) errors.description = "Add a short description.";
  else if (form.description.trim().length > 120) errors.description = "Keep it under 120 characters.";

  return errors;
}

export function ExpenseFormModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Expense | null;
  onClose: () => void;
}) {
  const { addExpense, updateExpense } = useExpenses();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // Reset to the right starting point each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setForm(editing ? toForm(editing) : emptyForm());
    setErrors({});
    setSubmitted(false);
  }, [open, editing]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const draft = {
      date: form.date,
      amount: Math.round(Number(form.amount.replace(",", ".")) * 100) / 100,
      category: form.category,
      description: form.description.trim(),
    };
    if (editing) updateExpense(editing.id, draft);
    else addExpense(draft);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit expense" : "Add expense"}
      description={
        editing ? "Update the details and save your changes." : "Record what you spent and where."
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor="expense-date" error={errors.date}>
            <Input
              id="expense-date"
              type="date"
              value={form.date}
              max={todayISO()}
              onChange={(event) => set("date", event.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
          </Field>

          <Field label="Amount (USD)" htmlFor="expense-amount" error={errors.amount}>
            <Input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
              aria-invalid={Boolean(errors.amount)}
            />
          </Field>
        </div>

        <Field label="Category" htmlFor="expense-category" error={errors.category}>
          <Select
            id="expense-category"
            value={form.category}
            onChange={(event) => set("category", event.target.value as CategoryId)}
          >
            {CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Description"
          htmlFor="expense-description"
          error={errors.description}
          hint="What was it? e.g. “Groceries at the corner market”"
        >
          <Input
            id="expense-description"
            type="text"
            maxLength={140}
            placeholder="Coffee with the team"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editing ? "Save changes" : "Add expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
