import type { Metadata } from "next";
import { SettingsClient } from "@/components/home/SettingsClient";
import { getOwnPreferences } from "@/lib/preferences/data";
import { EMPTY_PREFERENCES } from "@/lib/preferences/types";
import { getOwnProfessionalProfile } from "@/lib/professional/data";
import { getOwnProfile } from "@/lib/profiles/data";

export const metadata: Metadata = {
  title: "Settings — Haelo",
  description: "Manage your Haelo privacy, notifications, and account.",
};

export default async function SettingsPage() {
  const profile = await getOwnProfile();
  const [professional, preferences] = await Promise.all([
    profile?.accountRole === "professional"
      ? getOwnProfessionalProfile(profile.id)
      : Promise.resolve(null),
    profile ? getOwnPreferences() : Promise.resolve(EMPTY_PREFERENCES),
  ]);

  return (
    <SettingsClient
      username={profile?.username ?? null}
      accountRole={profile?.accountRole ?? "user"}
      professionalType={professional?.professionalType ?? null}
      professionalDisplayName={professional?.displayName ?? null}
      verificationStatus={professional?.verificationStatus ?? null}
      initialPreferences={preferences}
    />
  );
}
