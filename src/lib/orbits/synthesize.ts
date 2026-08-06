import { createClient } from "@/lib/supabase/server";
import { getOrbitByKey } from "./catalog";
import { getCanonicalOrbitSessions } from "./runtime";
import { generateOrbitSummativeAnalysis } from "./summativeAnalysis";
import type {
  OrbitSummativeAnalysisContent,
  OrbitSummativeAnalysisRow,
  UserOrbitProgressRow,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

export type OrbitSynthesisResult =
  | {
      status: "ready";
      analysis: OrbitSummativeAnalysisRow;
      content: OrbitSummativeAnalysisContent;
    }
  | {
      status: "pending";
      analysis: OrbitSummativeAnalysisRow;
    }
  | {
      status: "failed";
      analysis: OrbitSummativeAnalysisRow;
      message: string;
    }
  | {
      status: "missing";
      message: string;
    };

/**
 * Idempotent summative analysis generation.
 * Ready rows are returned as-is. Pending/failed can be (re)generated.
 * Orbit completion is independent — synthesis failure does not undo completion.
 */
export async function ensureOrbitSummativeAnalysis(opts: {
  userId: string;
  progress: UserOrbitProgressRow;
  forceRetry?: boolean;
}): Promise<OrbitSynthesisResult> {
  const orbit = getOrbitByKey(opts.progress.orbit_key);
  if (!orbit) {
    return { status: "missing", message: "Orbit definition not found." };
  }

  const supabase = await createClient();

  let analysisId = opts.progress.summative_analysis_id;
  let analysisRow: OrbitSummativeAnalysisRow | null = null;

  if (analysisId) {
    const { data } = await supabase
      .from("orbit_summative_analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", opts.userId)
      .maybeSingle();
    analysisRow = (data as OrbitSummativeAnalysisRow | null) ?? null;
  }

  if (!analysisRow) {
    const { data: existing } = await supabase
      .from("orbit_summative_analyses")
      .select("*")
      .eq("user_orbit_progress_id", opts.progress.id)
      .eq("user_id", opts.userId)
      .maybeSingle();

    if (existing) {
      analysisRow = existing as OrbitSummativeAnalysisRow;
      analysisId = analysisRow.id;
      if (!opts.progress.summative_analysis_id) {
        await supabase
          .from("user_orbit_progress")
          .update({
            summative_analysis_id: analysisRow.id,
            updated_at: nowIso(),
          })
          .eq("id", opts.progress.id);
      }
    } else {
      const { data: created, error: createError } = await supabase
        .from("orbit_summative_analyses")
        .insert({
          user_id: opts.userId,
          orbit_key: opts.progress.orbit_key,
          user_orbit_progress_id: opts.progress.id,
          status: "pending",
          analysis_json: null,
          practice_prompt: null,
          version: 1,
        })
        .select("*")
        .single();

      if (createError || !created) {
        return {
          status: "missing",
          message:
            createError?.message || "Could not create summative analysis row.",
        };
      }
      analysisRow = created as OrbitSummativeAnalysisRow;
      analysisId = analysisRow.id;
      await supabase
        .from("user_orbit_progress")
        .update({
          summative_analysis_id: analysisRow.id,
          updated_at: nowIso(),
        })
        .eq("id", opts.progress.id);
    }
  }

  if (
    analysisRow.status === "ready" &&
    analysisRow.analysis_json &&
    !opts.forceRetry
  ) {
    return {
      status: "ready",
      analysis: analysisRow,
      content: analysisRow.analysis_json as OrbitSummativeAnalysisContent,
    };
  }

  // Mark pending before generation (idempotent refresh-safe).
  await supabase
    .from("orbit_summative_analyses")
    .update({
      status: "pending",
      completed_at: null,
    })
    .eq("id", analysisRow.id)
    .eq("user_id", opts.userId);

  try {
    const canonical = await getCanonicalOrbitSessions(
      opts.userId,
      opts.progress.id,
      orbit,
    );

    if (canonical.length < 6) {
      const message =
        "All six Orbit reflections need to be saved before the final analysis.";
      await supabase
        .from("orbit_summative_analyses")
        .update({
          status: "failed",
          model_metadata: { error: message },
          completed_at: nowIso(),
        })
        .eq("id", analysisRow.id);

      return {
        status: "failed",
        analysis: { ...analysisRow, status: "failed" },
        message,
      };
    }

    const generated = await generateOrbitSummativeAnalysis({
      orbit,
      reflections: canonical.map((c) => ({
        sequenceNumber: c.question.sequenceNumber,
        planet: c.question.planet,
        prompt: c.promptText,
        transcript: c.transcript,
        analysisSummary: c.analysisSummary,
      })),
    });

    const { data: updated, error: updateError } = await supabase
      .from("orbit_summative_analyses")
      .update({
        status: "ready",
        analysis_json: generated.content,
        practice_prompt: generated.content.practicePrompt ?? null,
        model_metadata: generated.modelMetadata,
        completed_at: nowIso(),
      })
      .eq("id", analysisRow.id)
      .eq("user_id", opts.userId)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "Could not save summative analysis.");
    }

    return {
      status: "ready",
      analysis: updated as OrbitSummativeAnalysisRow,
      content: generated.content,
    };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "We're having trouble creating your final reflection.";

    await supabase
      .from("orbit_summative_analyses")
      .update({
        status: "failed",
        model_metadata: { error: message },
        completed_at: nowIso(),
      })
      .eq("id", analysisRow.id)
      .eq("user_id", opts.userId);

    return {
      status: "failed",
      analysis: { ...analysisRow, status: "failed" },
      message:
        "We're having trouble creating your final reflection. Try again.",
    };
  }
}

export async function getOrbitSummativeAnalysisForProgress(
  userId: string,
  progressId: string,
): Promise<OrbitSummativeAnalysisRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orbit_summative_analyses")
    .select("*")
    .eq("user_orbit_progress_id", progressId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as OrbitSummativeAnalysisRow | null) ?? null;
}
