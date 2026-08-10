"use server";

import { processGamificationEvent } from "@/lib/gamification/process";
import type {
  GamificationEvent,
  ProcessGamificationResult,
} from "@/lib/gamification/types";
import {
  GamificationAnalyticsEvents,
  trackGamificationEvent,
} from "@/lib/gamification/analytics";
import { createClient } from "@/lib/supabase/server";

const emptyResult: ProcessGamificationResult = {
  processed: false,
  alreadyProcessed: false,
  weekly: null,
  weeklyJustCompleted: false,
  planetStagesChanged: [],
  rewardsUnlocked: [],
  milestonesUnlocked: [],
  reveals: [],
};

export async function runGamificationEventAction(
  event: GamificationEvent,
): Promise<ProcessGamificationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return emptyResult;

  try {
    return await processGamificationEvent(supabase, user.id, event);
  } catch (e) {
    console.error("[gamification] process failed:", e);
    return emptyResult;
  }
}

export async function markGamificationRevealsViewedAction(
  revealIds: string[],
): Promise<void> {
  if (revealIds.length === 0) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();
  await supabase
    .from("user_gamification_reveals")
    .update({ viewed_at: now })
    .eq("user_id", user.id)
    .in("id", revealIds);

  trackGamificationEvent(GamificationAnalyticsEvents.DISCOVERY_VIEWED, {
    count: revealIds.length,
    userId: user.id,
  });
}

export async function markCelestialRewardViewedAction(
  rewardId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_celestial_rewards")
    .update({ viewed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("id", rewardId);
}

export async function markMilestoneViewedAction(
  milestoneId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_milestones")
    .update({ viewed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("id", milestoneId);
}

/** Mark that the user intentionally started Try the Experiment. */
export async function markExperimentIntentAction(
  sessionId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  trackGamificationEvent(GamificationAnalyticsEvents.EXPERIMENT_STARTED, {
    sessionId,
    userId: user?.id,
  });
}

/**
 * Persist experiment_tried_at when attempt 2 is saved via Try the Experiment.
 * Safe to call more than once.
 */
export async function markExperimentTriedAction(
  sessionId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();
  const { data } = await supabase
    .from("sessions")
    .update({ experiment_tried_at: now })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .is("experiment_tried_at", null)
    .select("id")
    .maybeSingle();

  if (data) {
    await processGamificationEvent(supabase, user.id, {
      type: "experiment_completed",
      sessionId,
    });
  }
}
