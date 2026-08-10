/**
 * Central gamification processor.
 * All post-completion side effects (weekly goal, planet evolution moments,
 * discoveries, milestones) run through processGamificationEvent.
 */

import {
  GamificationAnalyticsEvents,
  trackGamificationEvent,
} from "@/lib/gamification/analytics";
import {
  insertReward,
  mapReward,
  planetCounts,
  unlockOrbitReward,
  evaluateCelestialDiscoveries,
} from "@/lib/gamification/discoveries";
import { WEEKLY_VOICE_GOAL, MAX_IMMEDIATE_REVEALS } from "@/lib/gamification/config";
import {
  isEligibleReflection,
  isExperimentTry,
} from "@/lib/gamification/eligibility";
import { evaluateMilestones, type MetricSample } from "@/lib/gamification/milestones";
import {
  detectStageChanges,
  emptyPlanetExperience,
  evolutionStageFromExperience,
} from "@/lib/gamification/planetGrowth";
import type {
  EligibleSessionLite,
  GamificationEvent,
  GamificationReveal,
  ProcessGamificationResult,
  UserCelestialReward,
  UserMilestone,
  WeeklyVoiceProgress,
} from "@/lib/gamification/types";
import { weekKeyFromDate } from "@/lib/gamification/week";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { isNotificationCategoryEnabled } from "@/lib/preferences/types";
import { getPreferencesWith } from "@/lib/preferences/withClient";
import type { OrbitRegionKey } from "@/lib/orbits/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function eventKey(event: GamificationEvent): string {
  switch (event.type) {
    case "session_completed":
      return `session_completed:${event.sessionId}`;
    case "orbit_completed":
      return `orbit_completed:${event.orbitProgressId}`;
    case "experiment_completed":
      return `experiment_completed:${event.sessionId}`;
    case "weekly_goal_completed":
      return `weekly_goal_completed:${event.weekKey}`;
    case "planet_stage_changed":
      return `planet_stage_changed:${event.planet}:${event.stage}`;
  }
}

async function claimEvent(
  supabase: SupabaseClient,
  userId: string,
  event: GamificationEvent,
): Promise<boolean> {
  const key = eventKey(event);
  const { error } = await supabase.from("gamification_event_log").insert({
    user_id: userId,
    event_key: key,
    event_type: event.type,
    payload: event,
  });
  if (error) {
    // Unique violation → already processed
    if (error.code === "23505") return false;
    if (
      /Could not find the table/i.test(error.message) ||
      /schema cache/i.test(error.message)
    ) {
      return false;
    }
    console.error("[gamification] event claim failed:", error.message);
    return false;
  }
  return true;
}

function mapWeekly(row: {
  user_id: string;
  week_key: string;
  goal_count: number;
  completed_count: number;
  completed_at: string | null;
}): WeeklyVoiceProgress {
  return {
    userId: row.user_id,
    weekKey: row.week_key,
    goalCount: row.goal_count,
    completedCount: row.completed_count,
    completedAt: row.completed_at,
  };
}

function mapMilestone(row: {
  id: string;
  user_id: string;
  milestone_key: string;
  title: string;
  body: string;
  category: string;
  source_metadata: Record<string, unknown> | null;
  unlocked_at: string;
  viewed_at: string | null;
}): UserMilestone {
  return {
    id: row.id,
    userId: row.user_id,
    milestoneKey: row.milestone_key,
    title: row.title,
    body: row.body,
    category: row.category as UserMilestone["category"],
    sourceMetadata: row.source_metadata ?? {},
    unlockedAt: row.unlocked_at,
    viewedAt: row.viewed_at,
  };
}

function mapReveal(row: {
  id: string;
  user_id: string;
  reveal_key: string;
  reveal_type: string;
  priority: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  viewed_at: string | null;
}): GamificationReveal {
  return {
    id: row.id,
    userId: row.user_id,
    revealKey: row.reveal_key,
    revealType: row.reveal_type as GamificationReveal["revealType"],
    priority: row.priority as GamificationReveal["priority"],
    title: row.title,
    body: row.body,
    payload: row.payload ?? {},
    createdAt: row.created_at,
    viewedAt: row.viewed_at,
  };
}

async function loadEligibleSessions(
  supabase: SupabaseClient,
  userId: string,
): Promise<EligibleSessionLite[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, user_id, planet, status, source, completed_at, created_at, orbit_key, orbit_question_key, user_orbit_progress_id, experiment_tried_at",
    )
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) {
    console.error("[gamification] sessions load failed:", error.message);
    return [];
  }

  return ((data ?? []) as EligibleSessionLite[]).filter((s) =>
    isEligibleReflection({ status: s.status, source: s.source }),
  );
}

async function loadMetricSamples(
  supabase: SupabaseClient,
  userId: string,
  sessionIds: string[],
): Promise<MetricSample[]> {
  if (sessionIds.length === 0) return [];
  const { data, error } = await supabase
    .from("session_analyses")
    .select("session_id, journey_metrics, completed_at, created_at")
    .in("session_id", sessionIds.slice(0, 120))
    .eq("status", "ready");

  if (error || !data) return [];

  const sessionPlanet = new Map<string, VoicePlanetId>();
  // Planet comes from sessions; caller may pass — we re-query lightly
  const { data: sess } = await supabase
    .from("sessions")
    .select("id, planet, completed_at")
    .in("id", sessionIds.slice(0, 120));

  for (const row of sess ?? []) {
    sessionPlanet.set(row.id, row.planet as VoicePlanetId);
  }

  const samples: MetricSample[] = [];
  for (const row of data) {
    const metrics = row.journey_metrics as
      | Array<{ metric: string; score: number | null; status: string }>
      | null;
    if (!metrics) continue;
    const planet = sessionPlanet.get(row.session_id);
    if (!planet) continue;
    const at = row.completed_at ?? row.created_at;
    for (const m of metrics) {
      if (m.status !== "scored" || m.score == null) continue;
      samples.push({
        sessionId: row.session_id,
        planet,
        recordedAt: at,
        metric: m.metric as MetricSample["metric"],
        score: m.score,
      });
    }
  }
  return samples;
}

async function ensureWeeklyProgress(
  supabase: SupabaseClient,
  userId: string,
  weekKey: string,
): Promise<WeeklyVoiceProgress> {
  const { data: existing } = await supabase
    .from("weekly_voice_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existing) return mapWeekly(existing);

  const { data: created, error } = await supabase
    .from("weekly_voice_progress")
    .insert({
      user_id: userId,
      week_key: weekKey,
      goal_count: WEEKLY_VOICE_GOAL,
      completed_count: 0,
    })
    .select("*")
    .single();

  if (error || !created) {
    // Race: fetch again
    const { data: again } = await supabase
      .from("weekly_voice_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("week_key", weekKey)
      .single();
    if (!again) {
      return {
        userId,
        weekKey,
        goalCount: WEEKLY_VOICE_GOAL,
        completedCount: 0,
        completedAt: null,
      };
    }
    return mapWeekly(again);
  }
  return mapWeekly(created);
}

async function contributeWeekly(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  completedAt: string | null,
): Promise<{ progress: WeeklyVoiceProgress; justCompleted: boolean; contributed: boolean }> {
  const at = completedAt ? new Date(completedAt) : new Date();
  const weekKey = weekKeyFromDate(at);
  let progress = await ensureWeeklyProgress(supabase, userId, weekKey);

  const { error: contribError } = await supabase
    .from("weekly_voice_contributions")
    .insert({
      user_id: userId,
      week_key: weekKey,
      session_id: sessionId,
    });

  if (contribError) {
    if (contribError.code === "23505") {
      return { progress, justCompleted: false, contributed: false };
    }
    console.error("[gamification] weekly contrib failed:", contribError.message);
    return { progress, justCompleted: false, contributed: false };
  }

  const nextCount = progress.completedCount + 1;
  const justCompleted =
    progress.completedAt == null && nextCount >= progress.goalCount;
  const now = new Date().toISOString();

  const { data: updated } = await supabase
    .from("weekly_voice_progress")
    .update({
      completed_count: nextCount,
      completed_at: justCompleted ? now : progress.completedAt,
      updated_at: now,
    })
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .select("*")
    .single();

  progress = updated ? mapWeekly(updated) : { ...progress, completedCount: nextCount };

  return { progress, justCompleted, contributed: true };
}

async function queueReveal(
  supabase: SupabaseClient,
  userId: string,
  input: {
    revealKey: string;
    revealType: GamificationReveal["revealType"];
    priority: GamificationReveal["priority"];
    title: string;
    body?: string | null;
    payload?: Record<string, unknown>;
  },
): Promise<GamificationReveal | null> {
  const { data, error } = await supabase
    .from("user_gamification_reveals")
    .upsert(
      {
        user_id: userId,
        reveal_key: input.revealKey,
        reveal_type: input.revealType,
        priority: input.priority,
        title: input.title,
        body: input.body ?? null,
        payload: input.payload ?? {},
      },
      { onConflict: "user_id,reveal_key", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[gamification] reveal queue failed:", error.message);
    return null;
  }
  if (!data) return null;
  return mapReveal(data);
}

async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: "celestial_discovery" | "milestone_moment",
  referenceId: string | null,
) {
  // Milestones/discoveries are a non-essential category; honor the user's
  // notification preferences. Reveals still surface in the Universe.
  const prefs = await getPreferencesWith(supabase, userId);
  if (!isNotificationCategoryEnabled(prefs, "milestones_discoveries")) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    reference_id: referenceId,
  });
  if (error) {
    // Notifications may reject client inserts depending on RLS —
    // soft-fail; reveals still surface in Universe.
    console.warn("[gamification] notification insert:", error.message);
  }
}

/**
 * Process one gamification event idempotently.
 */
export async function processGamificationEvent(
  supabase: SupabaseClient,
  userId: string,
  event: GamificationEvent,
): Promise<ProcessGamificationResult> {
  const empty: ProcessGamificationResult = {
    processed: false,
    alreadyProcessed: false,
    weekly: null,
    weeklyJustCompleted: false,
    planetStagesChanged: [],
    rewardsUnlocked: [],
    milestonesUnlocked: [],
    reveals: [],
  };

  try {
    return await processGamificationEventInner(supabase, userId, event, empty);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (
      /Could not find the table/i.test(message) ||
      /schema cache/i.test(message) ||
      /relation .* does not exist/i.test(message)
    ) {
      // Migration not applied — skip quietly.
      return empty;
    }
    console.error("[gamification] process failed:", e);
    return empty;
  }
}

async function processGamificationEventInner(
  supabase: SupabaseClient,
  userId: string,
  event: GamificationEvent,
  empty: ProcessGamificationResult,
): Promise<ProcessGamificationResult> {

  const claimed = await claimEvent(supabase, userId, event);
  if (!claimed) {
    return { ...empty, alreadyProcessed: true };
  }

  const eligibleSessions = await loadEligibleSessions(supabase, userId);
  const experienceByPlanet = planetCounts(eligibleSessions);

  // Snapshot experience as if this session weren't counted yet for stage detect
  let beforeExperience = { ...experienceByPlanet };
  if (event.type === "session_completed") {
    const session = eligibleSessions.find((s) => s.id === event.sessionId);
    if (session && session.planet in beforeExperience) {
      beforeExperience = {
        ...beforeExperience,
        [session.planet]: Math.max(0, beforeExperience[session.planet] - 1),
      };
    } else {
      // Session may have just completed — if not in list yet, use current as after
      beforeExperience = emptyPlanetExperience();
      // Re-fetch won't help mid-transaction; approximate from current - 1 if found below
    }
  }

  const rewardsUnlocked: UserCelestialReward[] = [];
  const milestonesUnlocked: UserMilestone[] = [];
  const reveals: GamificationReveal[] = [];
  const planetStagesChanged: ProcessGamificationResult["planetStagesChanged"] =
    [];
  let weekly: WeeklyVoiceProgress | null = null;
  let weeklyJustCompleted = false;

  // --- Weekly goal (session completions only) ---
  if (event.type === "session_completed") {
    const session =
      eligibleSessions.find((s) => s.id === event.sessionId) ??
      (
        await supabase
          .from("sessions")
          .select(
            "id, user_id, planet, status, source, completed_at, created_at, orbit_key, orbit_question_key, user_orbit_progress_id, experiment_tried_at",
          )
          .eq("id", event.sessionId)
          .eq("user_id", userId)
          .maybeSingle()
      ).data;

    if (
      session &&
      isEligibleReflection({ status: session.status, source: session.source })
    ) {
      const typed = session as EligibleSessionLite;
      // Fix before-experience if session was already in the list
      if (eligibleSessions.some((s) => s.id === typed.id)) {
        beforeExperience = {
          ...experienceByPlanet,
          [typed.planet]: Math.max(0, experienceByPlanet[typed.planet] - 1),
        };
      } else {
        beforeExperience = { ...experienceByPlanet };
        experienceByPlanet[typed.planet] =
          (experienceByPlanet[typed.planet] ?? 0) + 1;
        eligibleSessions.push(typed);
      }

      const weeklyResult = await contributeWeekly(
        supabase,
        userId,
        typed.id,
        typed.completed_at,
      );
      weekly = weeklyResult.progress;
      weeklyJustCompleted = weeklyResult.justCompleted;

      if (weeklyJustCompleted) {
        trackGamificationEvent(
          GamificationAnalyticsEvents.WEEKLY_GOAL_COMPLETED,
          { weekKey: weekly.weekKey, userId },
        );
        const reveal = await queueReveal(supabase, userId, {
          revealKey: `weekly_complete:${weekly.weekKey}`,
          revealType: "weekly_goal_complete",
          priority: "immediate",
          title: "Your weekly constellation is complete.",
          body: "Three voice moments, gathered into one quiet shape.",
          payload: { weekKey: weekly.weekKey },
        });
        if (reveal) reveals.push(reveal);

        // Record weekly completion event for idempotent analytics / history
        await claimEvent(supabase, userId, {
          type: "weekly_goal_completed",
          weekKey: weekly.weekKey,
        });
      }

      // Planet stage changes
      const changes = detectStageChanges(beforeExperience, experienceByPlanet);
      for (const change of changes) {
        const claimedStage = await claimEvent(supabase, userId, {
          type: "planet_stage_changed",
          planet: change.planet,
          stage: change.stage,
          previousStage: change.previousStage,
        });
        if (!claimedStage) continue;

        planetStagesChanged.push(change);
        trackGamificationEvent(GamificationAnalyticsEvents.PLANET_EVOLVED, {
          planet: change.planet,
          stage: change.stage,
          userId,
        });

        const label =
          change.planet.charAt(0).toUpperCase() + change.planet.slice(1);
        const reveal = await queueReveal(supabase, userId, {
          revealKey: `planet_evolution:${change.planet}:${change.stage}`,
          revealType: "planet_evolution",
          priority: "immediate",
          title: `Your ${label} planet evolved.`,
          body: "Keep exploring to see what changes next.",
          payload: change,
        });
        if (reveal) reveals.push(reveal);
      }
    }
  }

  // --- Orbit completion reward ---
  if (event.type === "orbit_completed") {
    const { data: progress } = await supabase
      .from("user_orbit_progress")
      .select("id, orbit_key, status")
      .eq("id", event.orbitProgressId)
      .eq("user_id", userId)
      .maybeSingle();

    if (progress?.status === "completed") {
      const { data: existingRewards } = await supabase
        .from("user_celestial_rewards")
        .select("reward_key")
        .eq("user_id", userId);
      const existingKeys = new Set(
        (existingRewards ?? []).map((r) => r.reward_key as string),
      );

      const orbitReward = await unlockOrbitReward(
        supabase,
        userId,
        progress.id,
        progress.orbit_key,
        existingKeys,
      );
      if (orbitReward) {
        rewardsUnlocked.push(orbitReward);
        existingKeys.add(orbitReward.rewardKey);
        trackGamificationEvent(
          GamificationAnalyticsEvents.ORBIT_REWARD_UNLOCKED,
          { rewardKey: orbitReward.rewardKey, orbitKey: progress.orbit_key, userId },
        );
        const reveal = await queueReveal(supabase, userId, {
          revealKey: `orbit_reward:${progress.id}`,
          revealType: "orbit_reward",
          priority: "immediate",
          title: "You discovered something.",
          body: orbitReward.title,
          payload: {
            rewardKey: orbitReward.rewardKey,
            rewardType: orbitReward.rewardType,
          },
        });
        if (reveal) reveals.push(reveal);
      }
    }
  }

  // --- Experiment ack ---
  if (event.type === "experiment_completed") {
    const reveal = await queueReveal(supabase, userId, {
      revealKey: `experiment_ack:${event.sessionId}`,
      revealType: "experiment_ack",
      priority: "immediate",
      title: "You tested a new way of saying it.",
      body: "A small flare for trying the experiment.",
      payload: { sessionId: event.sessionId },
    });
    if (reveal) reveals.push(reveal);
    trackGamificationEvent(
      GamificationAnalyticsEvents.EXPERIMENT_COMPLETED,
      { sessionId: event.sessionId, userId },
    );
  }

  // --- Shared discovery + milestone evaluation ---
  const { data: orbitRows } = await supabase
    .from("user_orbit_progress")
    .select("id, orbit_key, status")
    .eq("user_id", userId)
    .eq("status", "completed");

  const completedOrbitProgressIds = (orbitRows ?? []).map((r) => r.id as string);
  const completedOrbitKeys = (orbitRows ?? []).map((r) => r.orbit_key as string);
  const completedRegions: OrbitRegionKey[] = [];
  for (const key of completedOrbitKeys) {
    const orbit = getOrbitByKey(key);
    if (orbit && !completedRegions.includes(orbit.regionKey)) {
      completedRegions.push(orbit.regionKey);
    }
  }

  const { count: weeklyCompleteCount } = await supabase
    .from("weekly_voice_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  const experimentCount = eligibleSessions.filter((s) =>
    isExperimentTry(s.experiment_tried_at),
  ).length;

  const { data: rewardRows } = await supabase
    .from("user_celestial_rewards")
    .select(
      "id, user_id, reward_key, reward_type, source_type, source_id, title, description, placement, planet, reveal_priority, unlocked_at, viewed_at",
    )
    .eq("user_id", userId);

  const existingRewardKeys = new Set(
    (rewardRows ?? []).map((r) => r.reward_key as string),
  );

  const discoveryDefs = evaluateCelestialDiscoveries({
    supabase,
    userId,
    event,
    eligibleSessions,
    experienceByPlanet,
    completedOrbitProgressIds,
    completedOrbitKeys,
    completedRegions,
    weeklyGoalsCompletedAllTime: weeklyCompleteCount ?? 0,
    experimentCount,
    existingRewardKeys,
  });

  for (const def of discoveryDefs) {
    const reward = await insertReward(supabase, userId, def, {
      sourceType: event.type,
      sourceId: eventKey(event),
    });
    if (!reward) continue;

    rewardsUnlocked.push(reward);
    trackGamificationEvent(
      GamificationAnalyticsEvents.CELESTIAL_DISCOVERY_UNLOCKED,
      { rewardKey: reward.rewardKey, userId },
    );

    const reveal = await queueReveal(supabase, userId, {
      revealKey: `discovery:${reward.rewardKey}`,
      revealType: "celestial_discovery",
      priority: def.revealPriority,
      title: `New celestial discovery: ${reward.title}`,
      body: reward.description,
      payload: { rewardKey: reward.rewardKey, rewardType: reward.rewardType },
    });
    if (reveal) reveals.push(reveal);

    if (def.revealPriority === "deferred") {
      await createNotification(supabase, userId, "celestial_discovery", reward.id);
    }
  }

  const { data: milestoneRows } = await supabase
    .from("user_milestones")
    .select("milestone_key")
    .eq("user_id", userId);
  const existingMilestoneKeys = new Set(
    (milestoneRows ?? []).map((r) => r.milestone_key as string),
  );

  const metricSamples = await loadMetricSamples(
    supabase,
    userId,
    eligibleSessions.map((s) => s.id),
  );

  const milestoneCandidates = evaluateMilestones({
    event,
    eligibleSessions,
    experienceByPlanet,
    completedOrbitCount: completedOrbitProgressIds.length,
    completedRegions,
    experimentCount,
    weeklyGoalsCompletedAllTime: weeklyCompleteCount ?? 0,
    existingMilestoneKeys,
    metricSamples,
  });

  for (const candidate of milestoneCandidates) {
    const { data: existingMs } = await supabase
      .from("user_milestones")
      .select("id")
      .eq("user_id", userId)
      .eq("milestone_key", candidate.milestoneKey)
      .maybeSingle();
    if (existingMs) continue;

    const { data: inserted, error } = await supabase
      .from("user_milestones")
      .insert({
        user_id: userId,
        milestone_key: candidate.milestoneKey,
        title: candidate.title,
        body: candidate.body,
        category: candidate.category,
        source_metadata: candidate.sourceMetadata ?? {},
      })
      .select("*")
      .maybeSingle();

    if (error || !inserted) continue;
    const mapped = mapMilestone(inserted);

    milestonesUnlocked.push(mapped);
    trackGamificationEvent(GamificationAnalyticsEvents.MILESTONE_UNLOCKED, {
      milestoneKey: mapped.milestoneKey,
      userId,
    });

    const reveal = await queueReveal(supabase, userId, {
      revealKey: `milestone:${mapped.milestoneKey}`,
      revealType: "milestone",
      priority: "deferred",
      title: mapped.title,
      body: mapped.body,
      payload: { milestoneKey: mapped.milestoneKey, category: mapped.category },
    });
    if (reveal) reveals.push(reveal);
    await createNotification(supabase, userId, "milestone_moment", mapped.id);
  }

  // Cap immediate reveals returned to the caller
  const immediate = reveals.filter((r) => r.priority === "immediate");
  if (immediate.length > MAX_IMMEDIATE_REVEALS) {
    // Keep highest-signal: planet evolution + orbit reward first
  }

  return {
    processed: true,
    alreadyProcessed: false,
    weekly,
    weeklyJustCompleted,
    planetStagesChanged,
    rewardsUnlocked,
    milestonesUnlocked,
    reveals,
  };
}

export { evolutionStageFromExperience, mapReward, mapWeekly };
