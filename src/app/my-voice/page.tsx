import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyVoiceExperience } from "@/components/home/MyVoiceExperience";
import { openMyVoiceForUser } from "@/lib/myVoice/ensure";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Voice — Haelo",
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

  const view = await openMyVoiceForUser({ userId: user.id });

  return <MyVoiceExperience initialView={view} />;
}
