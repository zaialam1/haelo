import { getProfessionalContext } from "./data";

export type ProfessionalGate =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "not_professional" };

/**
 * Gate for /professional/home and professional tools — any professional account.
 */
export async function requireProfessionalAccount(): Promise<ProfessionalGate> {
  const ctx = await getProfessionalContext();
  if (!ctx) return { ok: false, reason: "unauthenticated" };
  if (!ctx.isProfessional) return { ok: false, reason: "not_professional" };
  return { ok: true };
}

/** Alias kept for callers that previously checked verification. */
export async function requireVerifiedProfessional(): Promise<ProfessionalGate> {
  return requireProfessionalAccount();
}
