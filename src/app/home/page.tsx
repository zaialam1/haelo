import type { Metadata } from "next";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeUtilities } from "@/components/home/HomeUtilities";
import { ConversationUniverse } from "@/components/home/ConversationUniverse";
import { GamificationRevealOverlay } from "@/components/gamification/GamificationRevealOverlay";
import { WEEKLY_GOAL_INTRO_AFTER_SESSIONS } from "@/lib/gamification/config";
import {
  countEligibleReflections,
  getCurrentWeeklyVoiceProgress,
  getPendingGamificationReveals,
  getUserCelestialRewards,
} from "@/lib/gamification/data";
import { listOwnNotifications } from "@/lib/notifications/data";
import { getUniversePlanetEvolutionLevels } from "@/lib/planets/data";
import { getOwnProfile } from "@/lib/profiles/data";
import { getDailyQuestionForDate } from "@/lib/questions/bank";
import { TODAYS_QUESTION } from "@/lib/home/voicePlanets";
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

  const userId = user?.id ?? null;

  const [
    evolutionLevels,
    notifications,
    profile,
    weeklyProgress,
    celestialRewards,
    pendingReveals,
    reflectionCount,
  ] = await Promise.all([
    getUniversePlanetEvolutionLevels(userId),
    user ? listOwnNotifications() : Promise.resolve([]),
    user ? getOwnProfile() : Promise.resolve(null),
    getCurrentWeeklyVoiceProgress(userId),
    getUserCelestialRewards(userId),
    getPendingGamificationReveals(userId, { priority: "any", limit: 4 }),
    countEligibleReflections(userId),
  ]);

  const dailyQuestionText =
    getDailyQuestionForDate().text ?? TODAYS_QUESTION.text;

  const showWeeklyGoal = reflectionCount >= WEEKLY_GOAL_INTRO_AFTER_SESSIONS;

  // Prefer immediate reveals on Universe visit; include one deferred if none
  const immediate = pendingReveals.filter((r) => r.priority === "immediate");
  const deferred = pendingReveals.filter((r) => r.priority === "deferred");
  const revealsToShow =
    immediate.length > 0 ? immediate.slice(0, 2) : deferred.slice(0, 1);

  return (
    <div className="relative h-dvh overflow-hidden">
      <ConversationUniverse
        evolutionLevels={evolutionLevels}
        celestialRewards={celestialRewards}
        weeklyProgress={weeklyProgress}
        showWeeklyGoal={showWeeklyGoal}
      />
      <HomeNavWithRole />
      <HomeUtilities
        initialNotifications={notifications}
        recipientIsProfessional={profile?.accountRole === "professional"}
        dailyQuestionText={dailyQuestionText}
        weeklyProgress={showWeeklyGoal ? weeklyProgress : null}
      />
      <HomeBottomNav />
      {revealsToShow.length > 0 ? (
        <GamificationRevealOverlay reveals={revealsToShow} />
      ) : null}
    </div>
  );
}
