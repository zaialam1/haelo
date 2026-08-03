"use client";

import { useEffect, useState } from "react";
import { toggleTheme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
  /** Larger control for settings page */
  size?: "sm" | "md";
};

export function ThemeToggle({ className = "", size = "sm" }: ThemeToggleProps) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setReady(true);
  }, []);

  function onToggle() {
    const next = toggleTheme();
    setDark(next === "dark");
  }

  const padding = size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-2 text-xs";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border font-medium transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${padding} ${className}`}
      style={{
        borderColor: "var(--hairline)",
        color: "var(--foreground-muted)",
        visibility: ready ? "visible" : "hidden",
      }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {size === "md"
        ? dark
          ? "Light mode"
          : "Dark mode"
        : dark
          ? "Light"
          : "Dark"}
    </button>
  );
}
