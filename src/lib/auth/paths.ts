/** Only allow same-origin relative redirects. */
export function safeNextPath(
  path: string | null | undefined,
  fallback = "/home",
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
