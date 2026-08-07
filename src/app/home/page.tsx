import type { Metadata } from "next";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeUtilities } from "@/components/home/HomeUtilities";
import { ConversationUniverse } from "@/components/home/ConversationUniverse";
import { listOwnNotifications } from "@/lib/notifications/data";
import { getUniversePlanetEvolutionLevels } from "@/lib/planets/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home — Haelo",
  description: "Explore your personal voice universe in Haelo.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [evolutionLevels, notifications] = await Promise.all([
    getUniversePlanetEvolutionLevels(user?.id ?? null),
    user ? listOwnNotifications() : Promise.resolve([]),
  ]);

  return (
    <div className="relative h-dvh overflow-hidden">
      <ConversationUniverse evolutionLevels={evolutionLevels} />
      <HomeNavWithRole />
      <HomeUtilities initialNotifications={notifications} />
      <HomeBottomNav />
    </div>
  );
}
