import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyVoiceExperience } from "@/components/home/MyVoiceExperience";
import { openMyVoiceForUser } from "@/lib/myVoice/ensure";
import { getOnboardingSnapshot } from "@/lib/onboarding/data";
import { hasSeenMilestone } from "@/lib/preferences/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Voice — Halo",
  description:
    "Notice how your voice has been taking shape across Connect, Stand, Explore, and Express.",
};

export default async function MyVoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [view, onboarding] = await Promise.all([
    openMyVoiceForUser({ userId: user.id }),
    getOnboardingSnapshot(user.id),
  ]);
  const showIntro = !hasSeenMilestone(
    onboarding.preferences,
    "my_voice_opened",
  );

  return <MyVoiceExperience initialView={view} showIntro={showIntro} />;
}
