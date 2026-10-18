# Ledgerly — expense tracker

A personal expense tracker built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
and Recharts. Expenses are stored in the browser (`localStorage`), so there is no database or API key
to configure — clone, install, run.

## Features

- **Add, edit and delete expenses** — date, amount, category and description, validated inline
  (no future dates, positive amounts, required description). Deletes are undoable from the toast.
- **Filtering** — date-range presets (this month, last month, last 7/30/90 days, this year, all time)
  plus a custom from/to range, multi-select category chips, and free-text search over description and
  category. Filters drive the dashboard and the expense list alike.
- **Dashboard analytics** — a hero total with a like-for-like comparison against the previous period,
  stat tiles (daily average, expenses logged, top category, largest expense), a spending-over-time
  chart (daily columns for short ranges, a monthly line + area for longer ones) and a per-category
  breakdown. Both charts have a table view for screen readers and exact values.
- **Sortable, paginated list** — sort by date, description, category or amount; 25 rows at a time;
  a table on wide screens and stacked cards on phones.
- **CSV export** of whatever the current filters match.
- **Light and dark themes** — follows the OS by default, with a three-state toggle
  (system → light → dark) that persists and is applied before first paint.
- **Sample data** — six months of plausible expenses are seeded on a first visit, and can be
  reloaded or cleared from the Expenses page.

## Requirements

- Node.js 18.18+ (developed on Node 24)
- npm

## Run it

```bash
npm install          # already done if you are looking at a populated node_modules
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start            # http://localhost:3000
```

Other scripts:

```bash
npm run lint         # ESLint (next/core-web-vitals)
npx tsc --noEmit     # type check
```

## Project layout

```
app/
  layout.tsx            root layout: theme script, store provider, header, toaster
  page.tsx              dashboard (hero total, stat tiles, charts, recent activity)
  expenses/page.tsx     full expense list, CSV export, data management
  globals.css           design tokens (light + dark) and Tailwind theme mapping
components/
  expense-store.tsx     client store: persistence, CRUD, undo toasts, cross-tab sync
  expense-form.tsx      add/edit dialog with validation
  expense-list.tsx      sortable table / card list
  filter-bar.tsx        date range, search and category filters
  stat-tile.tsx         label · value · delta tile
  charts/               spending-over-time, category breakdown, shared tooltip
  ui/                   card, button, form field, modal primitives
lib/
  types.ts              Expense, Filters, sort types
  categories.ts         the nine categories (icon + label)
  filters.ts            range presets, filtering, sorting
  analytics.ts          totals, per-category, per-day, per-month, summaries
  storage.ts            localStorage read/write with validation
  sample-data.ts        deterministic six-month demo dataset
  csv.ts                CSV serialisation and download
  format.ts             money, date and month formatting
```

## How to test every feature by hand

Start the app (`npm run dev`) and open <http://localhost:3000>.

1. **First-run seeding** — the dashboard opens with six months of sample data and the range set to
   *This month*. To see the true empty state: Expenses → **Delete all**, then reload; the dashboard
   offers **Add expense** and **Load sample data**.
2. **Add an expense** — click **+ Add expense**. Submit the empty form: each field reports its own
   error. Try a future date and an amount of `0` — both are rejected. Enter a valid row (for example
   today, `12.50`, Food & dining, "Coffee with the team") and save; a toast confirms, the hero total
   and the charts update immediately.
3. **Edit** — Expenses → **Edit** on any row. The dialog opens pre-filled; change the amount or
   category and save. The row, the totals and the category breakdown all move.
4. **Delete and undo** — **Delete** on any row removes it instantly; click **Undo** in the toast
   within six seconds and it returns to its original position.
5. **Date filters** — switch the range dropdown between *This month*, *Last month*, *Last 7 days*,
   *Last 90 days*, *This year* and *All time*; the header subtitle, the hero total, the chart
   granularity (daily columns ≤ 62 days, monthly line beyond) and the list all follow. Choose
   *Custom range*, set from/to dates, and note that an inverted range is called out in place.
6. **Category filters** — click one or more category chips to intersect them; **All categories**
   clears them. The breakdown card, the stat tiles and the list respect the selection.
7. **Search** — type `coffee`, `rent` or `utilities` into the search box; it matches descriptions and
   category names. Combine it with a date range and a category to confirm the filters compose, then
   use **Reset** to clear everything back to *This month*.
8. **Sorting and paging** — on the Expenses page click the Date, Description, Category and Amount
   headers to sort (click again to reverse; the arrow shows the active column). With *All time*
   selected, **Show more** pages through the list 25 rows at a time.
9. **Charts** — hover the time chart for a tooltip at each point, and hover a category bar for its
   count and average. Use the **Table** toggle on either card to read the same data as a table, and
   the **Chart** toggle to go back.
10. **CSV export** — Expenses → **Export CSV** downloads `expenses-YYYY-MM-DD.csv` containing exactly
    the filtered rows (date, amount, category label, description).
11. **Themes** — click the icon in the top-right to cycle system → light → dark. Reload to confirm the
    choice is remembered with no flash of the wrong theme.
12. **Persistence** — add an expense, reload the page: it is still there. Open a second tab, add an
    expense there, and the first tab updates too.
13. **Responsive layout** — narrow the window below ~640px: the table becomes stacked cards, the stat
    tiles reflow to one column and the filter row wraps.

## Notes and limitations

- Data lives in `localStorage` under `expense-tracker:expenses:v1`, so it is per-browser and per-device,
  and a private window starts empty. Blocked storage degrades to a session-only, in-memory experience.
- Amounts are formatted as USD (`Intl.NumberFormat`); switching currency means changing `lib/format.ts`.
- Charts use one hue and one axis by design: category colour never encodes rank, and both charts ship a
  table view so no value is available only on hover.
