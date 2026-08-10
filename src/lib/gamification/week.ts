/**
 * Local-week helpers for the Weekly Voice Goal.
 * Weeks are Monday–Sunday in the user's local timezone (client clock /
 * Intl when available; server falls back to UTC Monday keys unless a
 * timezone is provided).
 */

/** Monday-start ISO week key: `YYYY-MM-DD` of that week's Monday (local). */
export function weekKeyFromDate(date: Date = new Date()): string {
  const local = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const day = local.getDay(); // 0 Sun … 6 Sat
  const mondayOffset = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + mondayOffset);
  return formatLocalDateKey(local);
}

export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a week_key back to the Monday Date at local midnight. */
export function mondayFromWeekKey(weekKey: string): Date {
  const [y, m, d] = weekKey.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function isCurrentWeekKey(weekKey: string, now = new Date()): boolean {
  return weekKey === weekKeyFromDate(now);
}
