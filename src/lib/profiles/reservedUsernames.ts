/**
 * Centralized reserved Haelo usernames.
 * Keep in sync with public.is_reserved_username() in migrations.
 */
export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "haelo",
  "support",
  "help",
  "moderator",
  "system",
  "official",
  "staff",
  "counselor",
  "counsellor",
  "professional",
  "root",
  "null",
  "undefined",
] as const;

const RESERVED_SET = new Set<string>(RESERVED_USERNAMES);

export function isReservedUsername(normalized: string): boolean {
  return RESERVED_SET.has(normalized);
}
