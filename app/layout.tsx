import type { Metadata } from "next";
import "./globals.css";
import { ExpenseStoreProvider } from "@/components/expense-store";
import { SiteHeader } from "@/components/site-header";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { Toaster } from "@/components/toaster";

export const metadata: Metadata = {
  title: "Ledgerly — expense tracker",
  description:
    "Track personal spending: add expenses, filter by date and category, and see where the money goes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Stamp the stored theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      {/* Browser extensions (Bitdefender, Grammarly, …) stamp attributes onto
          body before React hydrates; ignore attribute diffs on this element. */}
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ExpenseStoreProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
          <Toaster />
        </ExpenseStoreProvider>
      </body>
    </html>
  );
}
