import type { Metadata } from "next";
import { SettingsClient } from "@/components/home/SettingsClient";
import { getOwnProfessionalProfile } from "@/lib/professional/data";
import { getOwnProfile } from "@/lib/profiles/data";

export const metadata: Metadata = {
  title: "Settings — Haelo",
  description: "Manage your Haelo appearance and account preferences.",
};

export default async function SettingsPage() {
  const profile = await getOwnProfile();
  const professional =
    profile?.accountRole === "professional"
      ? await getOwnProfessionalProfile(profile.id)
      : null;

  return (
    <SettingsClient
      username={profile?.username ?? null}
      accountRole={profile?.accountRole ?? "user"}
      professionalType={professional?.professionalType ?? null}
      professionalDisplayName={professional?.displayName ?? null}
    />
  );
}
