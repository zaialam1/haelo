/** Session-scoped Personal | Professional mode for professional accounts. */

export type HaloAppMode = "personal" | "professional";

export const HALO_MODE_STORAGE_KEY = "halo-app-mode";

export function readStoredAppMode(): HaloAppMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(HALO_MODE_STORAGE_KEY);
    if (value === "personal" || value === "professional") return value;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredAppMode(mode: HaloAppMode) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HALO_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function clearStoredAppMode() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(HALO_MODE_STORAGE_KEY);
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
