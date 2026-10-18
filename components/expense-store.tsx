"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildSampleExpenses } from "@/lib/sample-data";
import { DEFAULT_FILTERS } from "@/lib/filters";
import {
  hasSeeded,
  loadExpenses,
  markSeeded,
  newId,
  saveExpenses,
  STORAGE_KEY,
} from "@/lib/storage";
import type { Expense, ExpenseDraft, Filters } from "@/lib/types";

type Toast = { id: string; message: string; undo?: () => void };

type ExpenseStore = {
  /** False until localStorage has been read, so the UI never renders stale empty state. */
  ready: boolean;
  expenses: Expense[];
  filters: Filters;
  setFilters: (next: Filters | ((current: Filters) => Filters)) => void;
  resetFilters: () => void;
  addExpense: (draft: ExpenseDraft) => Expense;
  updateExpense: (id: string, draft: ExpenseDraft) => void;
  removeExpense: (id: string) => void;
  loadSampleData: () => void;
  clearAll: () => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
};

const StoreContext = createContext<ExpenseStore | null>(null);

export function ExpenseStoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Hydrate from localStorage, seeding demo data on a genuinely first visit.
  useEffect(() => {
    const stored = loadExpenses();
    if (stored.length === 0 && !hasSeeded()) {
      const sample = buildSampleExpenses();
      setExpenses(sample);
      saveExpenses(sample);
      markSeeded();
    } else {
      setExpenses(stored);
    }
    setReady(true);
  }, []);

  // Persist on every change, but never before the first read has landed.
  useEffect(() => {
    if (!ready) return;
    saveExpenses(expenses);
  }, [expenses, ready]);

  // Keep other open tabs in sync.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      setExpenses(loadExpenses());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (message: string, undo?: () => void) => {
      const id = newId();
      setToasts((current) => [...current.slice(-2), { id, message, undo }]);
      const timer = setTimeout(() => dismissToast(id), 6000);
      timers.current.set(id, timer);
    },
    [dismissToast],
  );

  const setFilters = useCallback((next: Filters | ((current: Filters) => Filters)) => {
    setFiltersState((current) => (typeof next === "function" ? next(current) : next));
  }, []);

  const addExpense = useCallback(
    (draft: ExpenseDraft) => {
      const expense: Expense = { ...draft, id: newId(), createdAt: new Date().toISOString() };
      setExpenses((current) => [expense, ...current]);
      pushToast("Expense added");
      return expense;
    },
    [pushToast],
  );

  const updateExpense = useCallback(
    (id: string, draft: ExpenseDraft) => {
      setExpenses((current) =>
        current.map((expense) => (expense.id === id ? { ...expense, ...draft } : expense)),
      );
      pushToast("Expense updated");
    },
    [pushToast],
  );

  const removeExpense = useCallback(
    (id: string) => {
      setExpenses((current) => {
        const index = current.findIndex((expense) => expense.id === id);
        if (index === -1) return current;
        const removed = current[index];
        const next = current.filter((expense) => expense.id !== id);
        pushToast("Expense deleted", () =>
          setExpenses((latest) => {
            const restored = [...latest];
            restored.splice(Math.min(index, restored.length), 0, removed);
            return restored;
          }),
        );
        return next;
      });
    },
    [pushToast],
  );

  const loadSampleData = useCallback(() => {
    const sample = buildSampleExpenses();
    setExpenses(sample);
    markSeeded();
    pushToast(`Loaded ${sample.length} sample expenses`);
  }, [pushToast]);

  const clearAll = useCallback(() => {
    setExpenses((current) => {
      const snapshot = current;
      if (snapshot.length > 0) {
        pushToast(`Deleted all ${snapshot.length} expenses`, () => setExpenses(snapshot));
      }
      return [];
    });
    markSeeded();
  }, [pushToast]);

  const value = useMemo<ExpenseStore>(
    () => ({
      ready,
      expenses,
      filters,
      setFilters,
      resetFilters: () => setFiltersState(DEFAULT_FILTERS),
      addExpense,
      updateExpense,
      removeExpense,
      loadSampleData,
      clearAll,
      toasts,
      dismissToast,
    }),
    [
      ready,
      expenses,
      filters,
      setFilters,
      addExpense,
      updateExpense,
      removeExpense,
      loadSampleData,
      clearAll,
      toasts,
      dismissToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useExpenses(): ExpenseStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useExpenses must be used inside <ExpenseStoreProvider>");
  return store;
}
