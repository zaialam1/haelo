import type { Metadata } from "next";
import { AnalyticsBootstrap } from "@/components/analytics/AnalyticsBootstrap";
import { PageView } from "@/components/analytics/PageView";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeUtilities } from "@/components/home/HomeUtilities";
import { ContinueCue } from "@/components/home/ContinueCue";
import { ConversationUniverse } from "@/components/home/ConversationUniverse";
import { GamificationRevealOverlay } from "@/components/gamification/GamificationRevealOverlay";
import { UniverseIntroOverlay } from "@/components/onboarding/UniverseIntroOverlay";
import { WEEKLY_GOAL_INTRO_AFTER_SESSIONS } from "@/lib/gamification/config";
import {
  countEligibleReflections,
  getCurrentWeeklyVoiceProgress,
  getPendingGamificationReveals,
  getUserCelestialRewards,
} from "@/lib/gamification/data";
import { MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS } from "@/lib/myVoice/thresholds";
import { computeNextAction } from "@/lib/home/nextAction";
import { listOwnNotifications } from "@/lib/notifications/data";
import { getOnboardingSnapshot } from "@/lib/onboarding/data";
import { getUniversePlanetEvolutionLevels } from "@/lib/planets/data";
import { hasSeenMilestone } from "@/lib/preferences/types";
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
    onboarding,
  ] = await Promise.all([
    getUniversePlanetEvolutionLevels(userId),
    user ? listOwnNotifications() : Promise.resolve([]),
    user ? getOwnProfile() : Promise.resolve(null),
    getCurrentWeeklyVoiceProgress(userId),
    getUserCelestialRewards(userId),
    getPendingGamificationReveals(userId, { priority: "any", limit: 4 }),
    countEligibleReflections(userId),
    userId ? getOnboardingSnapshot(userId) : Promise.resolve(null),
  ]);

  const dailyQuestionText =
    getDailyQuestionForDate().text ?? TODAYS_QUESTION.text;

  const showWeeklyGoal = reflectionCount >= WEEKLY_GOAL_INTRO_AFTER_SESSIONS;

  // Progressive onboarding moments (server-persisted, never repeat)
  const showUniverseIntro = Boolean(
    onboarding &&
      onboarding.completedSessionCount === 0 &&
      !hasSeenMilestone(onboarding.preferences, "universe_seen"),
  );
  const showMyVoiceCue = Boolean(
    onboarding &&
      !showUniverseIntro &&
      reflectionCount >= MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS &&
      !hasSeenMilestone(onboarding.preferences, "my_voice_introduced"),
  );
  const explainPlanetGrowth = Boolean(
    onboarding &&
      !hasSeenMilestone(onboarding.preferences, "planet_growth_explained"),
  );

  // Prefer immediate reveals on Universe visit; include one deferred if none
  const immediate = pendingReveals.filter((r) => r.priority === "immediate");
  const deferred = pendingReveals.filter((r) => r.priority === "deferred");
  const revealsToShow =
    immediate.length > 0 ? immediate.slice(0, 2) : deferred.slice(0, 1);

  // Smart next action — skipped during first-visit onboarding
  const nextAction =
    userId && !showUniverseIntro
      ? await computeNextAction({
          userId,
          notifications,
          weeklyProgress,
          showWeeklyGoal,
        })
      : null;

  return (
    <div className="relative h-dvh overflow-hidden">
      <AnalyticsBootstrap userId={userId} />
      <PageView event="universe_opened" />
      <ConversationUniverse
        evolutionLevels={evolutionLevels}
        celestialRewards={celestialRewards}
        weeklyProgress={weeklyProgress}
        showWeeklyGoal={showWeeklyGoal}
        showMyVoiceCue={showMyVoiceCue}
      />
      {nextAction ? <ContinueCue action={nextAction} /> : null}
      <HomeNavWithRole />
      <HomeUtilities
        initialNotifications={notifications}
        recipientIsProfessional={profile?.accountRole === "professional"}
        dailyQuestionText={dailyQuestionText}
        weeklyProgress={showWeeklyGoal ? weeklyProgress : null}
      />
      <HomeBottomNav />
      {showUniverseIntro ? (
        <UniverseIntroOverlay />
      ) : revealsToShow.length > 0 ? (
        <GamificationRevealOverlay
          reveals={revealsToShow}
          explainPlanetGrowth={explainPlanetGrowth}
        />
      ) : null}
    </div>
  );
}
