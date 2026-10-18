"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "expense-tracker:theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const ICON: Record<Theme, string> = { system: "◐", light: "☀", dark: "☾" };
const LABEL: Record<Theme, string> = { system: "System theme", light: "Light theme", dark: "Dark theme" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function cycle() {
    const next = NEXT[theme];
    setTheme(next);
    apply(next);
    try {
      if (next === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, next);
    } catch {
      // theme preference is a convenience; ignore blocked storage
    }
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${LABEL[theme]} — click for ${LABEL[NEXT[theme]].toLowerCase()}`}
      aria-label={`${LABEL[theme]}. Switch to ${LABEL[NEXT[theme]].toLowerCase()}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-surface text-base text-ink-2 transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-series"
    >
      <span aria-hidden="true">{ICON[theme]}</span>
    </button>
  );
}

/** Runs before paint so a stored theme never flashes the wrong surface. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
