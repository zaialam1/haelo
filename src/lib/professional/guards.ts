import { getProfessionalContext } from "./data";

export type ProfessionalGate =
  | { ok: true; verified: boolean }
  | {
      ok: false;
      reason: "unauthenticated" | "not_professional" | "not_verified";
    };

/**
 * Gate for Professional Mode — any professional account (pending or verified).
 */
export async function requireProfessionalAccount(): Promise<ProfessionalGate> {
  const ctx = await getProfessionalContext();
  if (!ctx) return { ok: false, reason: "unauthenticated" };
  if (!ctx.isProfessional) return { ok: false, reason: "not_professional" };
  return { ok: true, verified: ctx.isVerified };
}

/**
 * Gate for search / connect / recommend actions — verified professionals only.
 */
export async function requireVerifiedProfessional(): Promise<ProfessionalGate> {
  const gate = await requireProfessionalAccount();
  if (!gate.ok) return gate;
  if (!gate.verified) return { ok: false, reason: "not_verified" };
  return gate;
}
