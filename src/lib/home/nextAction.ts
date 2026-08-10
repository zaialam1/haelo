/**
 * Smart return: compute the single best next action for the Universe.
 * One quiet cue, never a card stack. Priority order (highest first):
 * pending connection request → unread Orbit recommendation → in-progress
 * Orbit → weekly goal one-away → today's reflection → new My Voice summary
 * → planet close to evolving.
 */

import type { AppNotification } from "@/lib/connections/types";
import { isEligibleReflection } from "@/lib/gamification/eligibility";
import {
  emptyPlanetExperience,
  planetEvolutionTeaser,
} from "@/lib/gamification/planetGrowth";
import type { WeeklyVoiceProgress } from "@/lib/gamification/types";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { listUserOrbitProgress } from "@/lib/orbits/progress";
import { createClient } from "@/lib/supabase/server";

export type NextActionKind =
  | "connection_request"
  | "orbit_recommendation"
  | "orbit_in_progress"
  | "weekly_goal"
  | "daily_reflection"
  | "my_voice_update"
  | "planet_teaser";

export type NextAction = {
  kind: NextActionKind;
  title: string;
  cta: string;
  href: string;
  /** No activity for a while — soften the framing, no guilt. */
  welcomeBack: boolean;
};

const LONG_ABSENCE_DAYS = 7;

type SessionLite = {
  planet: string;
  source: string | null;
  completed_at: string | null;
};

function isSameLocalDay(iso: string, now: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export async function computeNextAction(opts: {
  userId: string;
  notifications: AppNotification[];
  weeklyProgress: WeeklyVoiceProgress | null;
  showWeeklyGoal: boolean;
}): Promise<NextAction | null> {
  const supabase = await createClient();

  const [{ data: sessionRows }, orbitProgress] = await Promise.all([
    supabase
      .from("sessions")
      .select("planet, source, completed_at")
      .eq("user_id", opts.userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(500),
    listUserOrbitProgress(opts.userId),
  ]);

  const sessions = (sessionRows ?? []) as SessionLite[];
  const now = new Date();
  const lastCompletedAt = sessions[0]?.completed_at ?? null;
  const welcomeBack = Boolean(
    lastCompletedAt &&
      now.getTime() - new Date(lastCompletedAt).getTime() >
        LONG_ABSENCE_DAYS * 24 * 60 * 60 * 1000,
  );

  // 1. Pending connection request
  const connectionRequest = opts.notifications.find(
    (n) => n.type === "connection_request",
  );
  if (connectionRequest) {
    return {
      kind: "connection_request",
      title: "Someone wants to connect with you.",
      cta: "View request",
      href: "/settings/connections",
      welcomeBack,
    };
  }

  // 2. Unread Orbit recommendation
  const recommendation = opts.notifications.find(
    (n) =>
      (n.type === "orbit_recommendation" ||
        n.type === "orbit_recommendation_reminder") &&
      !n.readAt,
  );
  if (recommendation?.referenceId) {
    return {
      kind: "orbit_recommendation",
      title: "An Orbit was recommended to you.",
      cta: "See it",
      href: `/orbits/recommended/${recommendation.referenceId}`,
      welcomeBack,
    };
  }

  // 3. In-progress Orbit
  const inProgress = orbitProgress.find((p) => p.status === "in_progress");
  if (inProgress) {
    const orbit = getOrbitByKey(inProgress.orbit_key);
    if (orbit) {
      const step = Math.min(
        Math.max(inProgress.current_question_index ?? 1, 1),
        6,
      );
      return {
        kind: "orbit_in_progress",
        title: `${orbit.title} — Reflection ${step} of 6.`,
        cta: "Continue Orbit",
        href: `/orbits/${orbit.orbitKey}`,
        welcomeBack,
      };
    }
  }

  // 4. Weekly goal one reflection away
  if (
    opts.showWeeklyGoal &&
    opts.weeklyProgress &&
    !opts.weeklyProgress.completedAt &&
    opts.weeklyProgress.completedCount ===
      Math.max(opts.weeklyProgress.goalCount - 1, 1)
  ) {
    return {
      kind: "weekly_goal",
      title: "One reflection completes this week's constellation.",
      cta: "Reflect now",
      href: "/practice",
      welcomeBack,
    };
  }

  // 5. Today's reflection
  const reflectedToday = sessions.some(
    (s) => s.completed_at && isSameLocalDay(s.completed_at, now),
  );
  if (!reflectedToday) {
    return {
      kind: "daily_reflection",
      title: welcomeBack
        ? "Whenever you're ready, today's question is here."
        : "Today's question is waiting.",
      cta: "Answer in 60 seconds",
      href: "/practice?from=today",
      welcomeBack,
    };
  }

  // 6. New My Voice summary
  const myVoiceUpdate = opts.notifications.find(
    (n) => n.type === "my_voice_updated" && !n.readAt,
  );
  if (myVoiceUpdate) {
    return {
      kind: "my_voice_update",
      title: "Your Voice has taken new shape.",
      cta: "Open My Voice",
      href: "/my-voice",
      welcomeBack,
    };
  }

  // 7. Planet close to evolving (mystery-preserving teaser)
  const counts = emptyPlanetExperience();
  for (const s of sessions) {
    if (
      isEligibleReflection({ status: "completed", source: s.source ?? "" }) &&
      s.planet in counts
    ) {
      counts[s.planet as VoicePlanetId] += 1;
    }
  }
  let best: { planet: VoicePlanetId; remaining: number } | null = null;
  for (const [planet, count] of Object.entries(counts)) {
    const teaser = planetEvolutionTeaser(
      planet as VoicePlanetId,
      count as number,
    );
    if (
      teaser.remainingToNext != null &&
      teaser.remainingToNext > 0 &&
      teaser.remainingToNext <= 2 &&
      (!best || teaser.remainingToNext < best.remaining)
    ) {
      best = {
        planet: planet as VoicePlanetId,
        remaining: teaser.remainingToNext,
      };
    }
  }
  if (best) {
    const planetDef = getVoicePlanetById(best.planet);
    if (planetDef) {
      return {
        kind: "planet_teaser",
        title: `${planetDef.label} is close to changing.`,
        cta: "Add a reflection",
        href: planetDef.href,
        welcomeBack,
      };
    }
  }

  return null;
}
