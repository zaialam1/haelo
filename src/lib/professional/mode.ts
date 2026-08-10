/** Session-scoped Personal | Professional mode for professional accounts. */

export type HaeloAppMode = "personal" | "professional";

export const HAELO_MODE_STORAGE_KEY = "haelo-app-mode";

export function readStoredAppMode(): HaeloAppMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(HAELO_MODE_STORAGE_KEY);
    if (value === "personal" || value === "professional") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredAppMode(mode: HaeloAppMode) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HAELO_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function clearStoredAppMode() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(HAELO_MODE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isProfessionalPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === "/professional") return true;
  return (
    pathname.startsWith("/professional/") &&
    !pathname.startsWith("/professional/about")
  );
}

export function personalHomePath() {
  return "/home";
}

export function professionalHomePath() {
  return "/professional";
}
