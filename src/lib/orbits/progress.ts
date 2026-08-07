import { createClient } from "@/lib/supabase/server";
import {
  getOrbitByKey,
  getOrbitPlanetSequence,
  getOrbitPlanetsInvolved,
  getActiveOrbits,
  getOrbitsByRegion,
} from "./catalog";
import { CURRENT_CONTENT_VERSION } from "./defineOrbit";
import type { OrbitRegionKey } from "./types";
import type {
  OrbitListItem,
  OrbitStatus,
  UserOrbitProgressRow,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Start or resume an Orbit. Idempotent for an existing in-progress row.
 * Does not touch normal planet progression.
 */
export async function startOrResumeOrbit(
  userId: string,
  orbitKey: string,
  opts?: { sourceRecommendationId?: string | null },
): Promise<UserOrbitProgressRow> {
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) {
    throw new Error(`Orbit not found or inactive: ${orbitKey}`);
  }

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("orbit_key", orbitKey)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message || "Could not load Orbit progress.");
  }

  if (existing) {
    if (existing.status === "completed") {
      return existing as UserOrbitProgressRow;
    }

    const patch: Record<string, unknown> = {
      status: existing.status === "not_started" ? "in_progress" : existing.status,
      started_at: existing.started_at ?? nowIso(),
      last_activity_at: nowIso(),
      updated_at: nowIso(),
    };

    // Link recommendation if progress has none yet.
    if (
      opts?.sourceRecommendationId &&
      !existing.source_recommendation_id
    ) {
      patch.source_recommendation_id = opts.sourceRecommendationId;
    }

    const { data: updated, error: updateError } = await supabase
      .from("user_orbit_progress")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "Could not resume Orbit.");
    }
    return updated as UserOrbitProgressRow;
  }

  const { data: created, error: insertError } = await supabase
    .from("user_orbit_progress")
    .insert({
      user_id: userId,
      orbit_key: orbitKey,
      status: "in_progress" satisfies OrbitStatus,
      current_question_index: 1,
      started_at: nowIso(),
      last_activity_at: nowIso(),
      orbit_version: orbit.version || CURRENT_CONTENT_VERSION,
      orbit_title_snapshot: orbit.title,
      source_recommendation_id: opts?.sourceRecommendationId ?? null,
      updated_at: nowIso(),
    })
    .select("*")
    .single();

  if (insertError || !created) {
    throw new Error(insertError?.message || "Could not start Orbit.");
  }

  return created as UserOrbitProgressRow;
}

export async function getUserOrbitProgress(
  userId: string,
  orbitKey: string,
): Promise<UserOrbitProgressRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("orbit_key", orbitKey)
    .maybeSingle();

  if (error) {
    console.error("[orbits] progress fetch failed:", error.message);
    return null;
  }
  return (data as UserOrbitProgressRow | null) ?? null;
}

export async function listUserOrbitProgress(
  userId: string,
): Promise<UserOrbitProgressRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[orbits] progress list failed:", error.message);
    return [];
  }
  return (data ?? []) as UserOrbitProgressRow[];
}

/**
 * After an Orbit question session is completed, advance progress.
 * Completes the Orbit only when all 6 canonical sessions exist.
 * Never increments planet progression indexes.
 */
export async function recordOrbitQuestionCompleted(opts: {
  userId: string;
  progressId: string;
  sequenceNumber: number;
}): Promise<UserOrbitProgressRow> {
  const supabase = await createClient();

  const { data: progress, error: progressError } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("id", opts.progressId)
    .eq("user_id", opts.userId)
    .maybeSingle();

  if (progressError || !progress) {
    throw new Error("Orbit progress not found.");
  }

  if (progress.status === "completed") {
    return progress as UserOrbitProgressRow;
  }

  const orbit = getOrbitByKey(progress.orbit_key);
  if (!orbit) {
    throw new Error(`Orbit definition missing: ${progress.orbit_key}`);
  }

  // Count completed orbit sessions for this progress (canonical responses).
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("id, orbit_question_key, status")
    .eq("user_id", opts.userId)
    .eq("user_orbit_progress_id", opts.progressId)
    .eq("source", "orbit")
    .eq("status", "completed");

  if (sessionsError) {
    throw new Error(sessionsError.message || "Could not verify Orbit sessions.");
  }

  const completedKeys = new Set(
    (sessions ?? [])
      .map((s) => s.orbit_question_key as string | null)
      .filter(Boolean),
  );

  const allRequiredDone = orbit.questions.every((q) =>
    completedKeys.has(q.questionKey),
  );

  const nextIndex = Math.min(
    6,
    Math.max(opts.sequenceNumber + 1, progress.current_question_index),
  );

  const patch: Record<string, unknown> = {
    status: allRequiredDone ? "completed" : "in_progress",
    current_question_index: allRequiredDone ? 6 : nextIndex,
    last_activity_at: nowIso(),
    updated_at: nowIso(),
    completed_at: allRequiredDone ? nowIso() : null,
  };

  const { data: updated, error: updateError } = await supabase
    .from("user_orbit_progress")
    .update(patch)
    .eq("id", opts.progressId)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Could not update Orbit progress.");
  }

  // Stub summative analysis row when newly completed (AI generation later).
  if (allRequiredDone && !updated.summative_analysis_id) {
    const { data: analysis, error: analysisError } = await supabase
      .from("orbit_summative_analyses")
      .insert({
        user_id: opts.userId,
        orbit_key: progress.orbit_key,
        user_orbit_progress_id: opts.progressId,
        status: "pending",
        analysis_json: null,
        practice_prompt: null,
        version: 1,
      })
      .select("id")
      .single();

    if (!analysisError && analysis) {
      await supabase
        .from("user_orbit_progress")
        .update({
          summative_analysis_id: analysis.id,
          updated_at: nowIso(),
        })
        .eq("id", opts.progressId);

      // Mark any linked / matching recommendations completed (private to user).
      await supabase.rpc("complete_orbit_recommendation_for_progress", {
        p_progress_id: opts.progressId,
      });

      return {
        ...(updated as UserOrbitProgressRow),
        summative_analysis_id: analysis.id,
      };
    }
  }

  if (allRequiredDone) {
    await supabase.rpc("complete_orbit_recommendation_for_progress", {
      p_progress_id: opts.progressId,
    });
  }

  return updated as UserOrbitProgressRow;
}

export async function buildOrbitList(opts: {
  userId: string | null;
  regionKey?: OrbitRegionKey;
}): Promise<OrbitListItem[]> {
  const definitions = opts.regionKey
    ? getOrbitsByRegion(opts.regionKey)
    : getActiveOrbits();

  const progressByKey = new Map<string, UserOrbitProgressRow>();
  if (opts.userId) {
    const rows = await listUserOrbitProgress(opts.userId);
    for (const row of rows) {
      progressByKey.set(row.orbit_key, row);
    }
  }

  return definitions.map((definition) => ({
    definition,
    progress: progressByKey.get(definition.orbitKey) ?? null,
    planetsInvolved: getOrbitPlanetsInvolved(definition),
    planetSequence: getOrbitPlanetSequence(definition),
  }));
}
