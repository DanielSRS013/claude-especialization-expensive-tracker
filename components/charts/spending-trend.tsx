"use client";

import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { Card, CardHeader } from "../ui/card";
import { dailyTotals, monthlyTotals, type MonthTotal } from "@/lib/analytics";
import { formatDate, formatDateShort, formatMoney, formatMoneyCompact, formatMonthKey } from "@/lib/format";
import { resolveRange } from "@/lib/filters";
import type { Expense, Filters } from "@/lib/types";

type Point = { key: string; label: string; total: number };

const AXIS = { fontSize: 12, fill: "var(--muted)" } as const;

/**
 * One series, one hue, one axis. Days while the window is short enough to read
 * day by day (columns), calendar months once it is longer (line + area wash).
 */
export function SpendingTrend({
  expenses,
  allExpenses,
  filters,
}: {
  expenses: Expense[];
  allExpenses: Expense[];
  filters: Filters;
}) {
  const [showTable, setShowTable] = useState(false);

  const { points, granularity } = useMemo(() => {
    const range = resolveRange(filters);
    const days = dailyTotals(expenses, range);
    if (days.length > 0 && days.length <= 62) {
      return {
        granularity: "day" as const,
        points: days.map((day) => ({
          key: day.date,
          label: formatDateShort(day.date),
          total: day.total,
        })),
      };
    }
    // Months come from the unfiltered set so category filters still read as a
    // slice of the same timeline; the range filter is applied below.
    const source = filters.categories.length > 0 || filters.search.trim() ? expenses : allExpenses;
    const months: MonthTotal[] = monthlyTotals(source, 12);
    const visible = months.filter((month) => {
      if (range.from && `${month.key}-31` < range.from) return false;
      if (range.to && `${month.key}-01` > range.to) return false;
      return true;
    });
    return {
      granularity: "month" as const,
      points: (visible.length > 0 ? visible : months).map((month) => ({
        key: month.key,
        label: formatMonthKey(month.key, { short: true }),
        total: month.total,
      })),
    };
  }, [expenses, allExpenses, filters]);

  const peak = points.reduce<Point | null>(
    (max, point) => (max === null || point.total > max.total ? point : max),
    null,
  );
  const hasData = points.some((point) => point.total > 0);
  const labelFor = (key: string) =>
    granularity === "day" ? formatDate(key) : formatMonthKey(key);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Spending over time"
        subtitle={
          granularity === "day"
            ? "Daily total in the selected range"
            : "Monthly total across the selected range"
        }
        action={
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            className="rounded-lg border border-hairline px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            aria-pressed={showTable}
          >
            {showTable ? "Chart" : "Table"}
          </button>
        }
      />

      {!hasData ? (
        <p className="py-14 text-center text-sm text-ink-2">
          No spending in this range yet.
        </p>
      ) : showTable ? (
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Spending over time</caption>
            <thead className="sticky top-0 bg-surface text-left text-xs text-ink-2 uppercase">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  {granularity === "day" ? "Day" : "Month"}
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.key} className="border-t border-hairline">
                  <td className="py-2 text-ink-2">{labelFor(point.key)}</td>
                  <td className="py-2 text-right font-medium text-ink tabular-nums">
                    {formatMoney(point.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="min-h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--grid)" strokeWidth={1} />
                <XAxis
                  dataKey="label"
                  tick={AXIS}
                  tickLine={false}
                  axisLine={{ stroke: "var(--axis)" }}
                  minTickGap={granularity === "day" ? 24 : 8}
                />
                <YAxis
                  tick={AXIS}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(value: number) => formatMoneyCompact(value)}
                />
                <Tooltip
                  cursor={{ fill: "var(--series-1-wash)", stroke: "transparent" }}
                  content={<ChartTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />
                {granularity === "day" ? (
                  <Bar
                    dataKey="total"
                    name="Spending"
                    fill="var(--series-1)"
                    maxBarSize={24}
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <Area
                    dataKey="total"
                    name="Spending"
                    type="monotone"
                    stroke="var(--series-1)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="var(--series-1-wash)"
                    dot={{ r: 4, fill: "var(--series-1)", stroke: "var(--surface)", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "var(--series-1)", stroke: "var(--surface)", strokeWidth: 2 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {peak && peak.total > 0 ? (
            <p className="mt-3 text-sm text-ink-2">
              Peak: <span className="font-medium text-ink">{formatMoney(peak.total)}</span> on{" "}
              {labelFor(peak.key)}
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}
