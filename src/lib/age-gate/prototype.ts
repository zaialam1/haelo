/**
 * Prototype-only age / parental-consent helpers.
 *
 * There is NO email provider, Supabase, or verification backend in this project yet.
 * These helpers only store flags in sessionStorage so the UI flow can be tested.
 *
 * This is NOT a production parental-consent system and is NOT legally compliant by itself.
 */

export type AgeGateStatus =
  | "unverified"
  | "cleared_13_plus"
  | "awaiting_parent"
  | "parent_approved";

const STATUS_KEY = "attune-age-gate";
const PARENT_EMAIL_KEY = "attune-parent-email";
const APPROVAL_TOKEN_KEY = "attune-parent-token";

export function getAgeGateStatus(): AgeGateStatus {
  if (typeof window === "undefined") return "unverified";
  const value = sessionStorage.getItem(STATUS_KEY);
  if (
    value === "cleared_13_plus" ||
    value === "awaiting_parent" ||
    value === "parent_approved"
  ) {
    return value;
  }
  return "unverified";
}

export function setAgeGateStatus(status: AgeGateStatus) {
  sessionStorage.setItem(STATUS_KEY, status);
}

export function isAgeGateCleared(): boolean {
  const status = getAgeGateStatus();
  return status === "cleared_13_plus" || status === "parent_approved";
}

export function saveParentEmailPrototype(email: string): string {
  const token = crypto.randomUUID();
  sessionStorage.setItem(PARENT_EMAIL_KEY, email.trim().toLowerCase());
  sessionStorage.setItem(APPROVAL_TOKEN_KEY, token);
  setAgeGateStatus("awaiting_parent");
  return token;
}

export function getParentEmailPrototype(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PARENT_EMAIL_KEY);
}

export function getApprovalTokenPrototype(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(APPROVAL_TOKEN_KEY);
}

/** Simulates a parent clicking an emailed approval link. */
export function approveParentConsentPrototype(token: string): boolean {
  const expected = sessionStorage.getItem(APPROVAL_TOKEN_KEY);
  if (!expected || expected !== token) return false;
  setAgeGateStatus("parent_approved");
  return true;
}
