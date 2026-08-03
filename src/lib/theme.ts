export const THEME_STORAGE_KEY = "haelo-theme";

export type ThemeMode = "light" | "dark";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(mode: ThemeMode) {
  const dark = mode === "dark";
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  applyTheme(next);
  return next;
}
