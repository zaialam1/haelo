import { isReservedUsername } from "./reservedUsernames";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

/** Letters, numbers, underscores; no leading/trailing underscore. */
const USERNAME_RE = /^[a-z0-9]([a-z0-9_]{1,18}[a-z0-9])?$/;

export type UsernameValidationError =
  | "empty"
  | "too_short"
  | "too_long"
  | "invalid_chars"
  | "reserved";

export type UsernameValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; error: UsernameValidationError; message: string };

/**
 * Strip leading @ and lowercase for identity / lookup.
 */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function formatUsernameDisplay(username: string): string {
  const normalized = normalizeUsername(username);
  return normalized ? `@${normalized}` : "";
}

export function validateUsername(raw: string): UsernameValidationResult {
  const normalized = normalizeUsername(raw);

  if (!normalized) {
    return {
      ok: false,
      error: "empty",
      message: "Choose a Haelo name.",
    };
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: "too_short",
      message: `Use at least ${USERNAME_MIN_LENGTH} characters.`,
    };
  }

  if (normalized.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: "too_long",
      message: `Use at most ${USERNAME_MAX_LENGTH} characters.`,
    };
  }

  if (!USERNAME_RE.test(normalized)) {
    return {
      ok: false,
      error: "invalid_chars",
      message:
        "Use letters, numbers, and underscores. Don’t start or end with an underscore.",
    };
  }

  if (isReservedUsername(normalized)) {
    return {
      ok: false,
      error: "reserved",
      message: "That Haelo name isn’t available.",
    };
  }

  return { ok: true, normalized };
}

export type UsernameAvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "invalid"
  | "reserved"
  | "taken"
  | "unauthenticated"
  | "error";

export function availabilityMessage(
  status: UsernameAvailabilityStatus,
  normalized?: string,
): string | null {
  switch (status) {
    case "available":
      return normalized
        ? `${formatUsernameDisplay(normalized)} is available`
        : "Available";
    case "taken":
      return "That Haelo name is already taken";
    case "reserved":
      return "That Haelo name isn’t available";
    case "invalid":
      return null;
    case "checking":
      return "Checking…";
    default:
      return null;
  }
}
