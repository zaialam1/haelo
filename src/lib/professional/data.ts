import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/profiles/data";
import type { AccountRole, Profile } from "@/lib/profiles/types";
import {
  mapProfessionalProfileRow,
  type ProfessionalProfile,
  type ProfessionalProfileRow,
  type ProfessionalVerificationStatus,
} from "./types";

export type ProfessionalContext = {
  profile: Profile;
  professional: ProfessionalProfile | null;
  isProfessional: boolean;
  isVerified: boolean;
  verificationStatus: ProfessionalVerificationStatus | null;
};

export async function getOwnProfessionalProfile(
  userId?: string,
): Promise<ProfessionalProfile | null> {
  const supabase = await createClient();
  let id = userId;
  if (!id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    id = user.id;
  }

  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      "user_id, display_name, professional_type, organization_name, verification_status, created_at, updated_at",
    )
    .eq("user_id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfessionalProfileRow(data as ProfessionalProfileRow);
}

export async function getProfessionalContext(): Promise<ProfessionalContext | null> {
  const profile = await getOwnProfile();
  if (!profile) return null;

  const isProfessional = profile.accountRole === "professional";
  const professional = isProfessional
    ? await getOwnProfessionalProfile(profile.id)
    : null;

  const isVerified =
    isProfessional && professional?.verificationStatus === "verified";

  return {
    profile,
    professional,
    isProfessional,
    isVerified,
    verificationStatus: professional?.verificationStatus ?? null,
  };
}

export function roleIsProfessional(role: AccountRole | null | undefined) {
  return role === "professional";
}
