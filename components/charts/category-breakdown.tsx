"use client";

import { useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { formatMoney } from "@/lib/format";
import type { CategoryTotal } from "@/lib/analytics";

/**
 * Magnitude, low to high: horizontal bars in one hue, direct-labelled at the
 * tip. Plain HTML marks — no second axis, no hue per category, no rank repaint.
 */
export function CategoryBreakdown({ rows }: { rows: CategoryTotal[] }) {
  const [showTable, setShowTable] = useState(false);
  const max = rows.reduce((peak, row) => Math.max(peak, row.total), 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Where the money goes"
        subtitle="Total per category in the selected range"
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

      {rows.length === 0 ? (
        <p className="py-14 text-center text-sm text-ink-2">No spending in this range yet.</p>
      ) : showTable ? (
        <table className="w-full text-sm">
          <caption className="sr-only">Total per category</caption>
          <thead className="text-left text-xs text-ink-2 uppercase">
            <tr>
              <th scope="col" className="py-2 font-medium">
                Category
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Expenses
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Share
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-hairline">
                <td className="py-2 text-ink">
                  <span aria-hidden="true" className="mr-1.5">
                    {row.icon}
                  </span>
                  {row.label}
                </td>
                <td className="py-2 text-right text-ink-2 tabular-nums">{row.count}</td>
                <td className="py-2 text-right text-ink-2 tabular-nums">
                  {Math.round(row.share * 100)}%
                </td>
                <td className="py-2 text-right font-medium text-ink tabular-nums">
                  {formatMoney(row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => (
            <li key={row.id} className="group">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-ink">
                  <span aria-hidden="true" className="mr-1.5">
                    {row.icon}
                  </span>
                  {row.label}
                </span>
                <span className="shrink-0 text-sm font-medium text-ink tabular-nums">
                  {formatMoney(row.total)}
                  <span className="ml-2 text-xs font-normal text-muted">
                    {Math.round(row.share * 100)}%
                  </span>
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
                role="img"
                aria-label={`${row.label}: ${formatMoney(row.total)}, ${Math.round(
                  row.share * 100,
                )} percent of the range, across ${row.count} ${
                  row.count === 1 ? "expense" : "expenses"
                }`}
              >
                <div
                  className="h-full rounded-r-[4px] transition-[width] duration-500"
                  style={{
                    width: `${max > 0 ? Math.max((row.total / max) * 100, 1.5) : 0}%`,
                    background: "var(--series-1)",
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
                {row.count} {row.count === 1 ? "expense" : "expenses"} · average{" "}
                {formatMoney(row.total / row.count)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
