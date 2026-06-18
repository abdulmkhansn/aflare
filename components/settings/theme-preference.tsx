"use client";

import { useEffect, useState } from "react";

import { THEME_STORAGE_KEY, type ThemeMode } from "@/lib/theme/constants";
import { focusRingClassName } from "@/lib/ui/classes";

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function readTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

type ThemePreferenceProps = {
  variant?: "toggle" | "settings";
};

export function ThemePreference({ variant = "toggle" }: ThemePreferenceProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function chooseTheme(next: ThemeMode) {
    applyTheme(next);
    setTheme(next);
  }

  if (variant === "settings") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => chooseTheme("light")}
          aria-pressed={theme === "light"}
          className={`cursor-pointer rounded-md border px-3 py-2 text-sm outline-none transition-colors ${focusRingClassName} ${
            theme === "light"
              ? "border-ember bg-ember/10 text-fg"
              : "border-[var(--border-input)] bg-surface-card text-fg-muted hover:bg-[var(--hover-subtle)]"
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => {
            chooseTheme("dark");
          }}
          aria-pressed={theme === "dark"}
          className={`cursor-pointer rounded-md border px-3 py-2 text-sm outline-none transition-colors ${focusRingClassName} ${
            theme === "dark"
              ? "border-ember bg-ember/10 text-fg"
              : "border-[var(--border-input)] bg-surface-card text-fg-muted hover:bg-[var(--hover-subtle)]"
          }`}
        >
          Dark
        </button>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => chooseTheme(isDark ? "light" : "dark")}
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-ember outline-none transition-colors hover:bg-[var(--hover-subtle)] focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-header ${focusRingClassName}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
