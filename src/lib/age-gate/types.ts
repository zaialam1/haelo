export type AgeGateStatus =
  | "unverified"
  | "cleared_13_plus"
  | "awaiting_parent"
  | "parent_approved";

export function isAgeGateCleared(status: AgeGateStatus | string | null | undefined): boolean {
  return status === "cleared_13_plus" || status === "parent_approved";
}
