/**
 * Server-side My Voice orchestration: authorize, gather, refresh, persist.
 */

import {
  formatMyVoiceUpdatedLabel,
  decideMyVoiceRefresh,
  myVoicePhaseFromSessionCount,
} from "./thresholds";
import { gatherMyVoiceHistory } from "./evidence";
import { generateMyVoiceSummaryContent } from "./generate";
import { getOwnVoiceSummaryRow, upsertOwnVoiceSummary } from "./data";
import { trackMyVoiceEvent } from "./events";
import { createMyVoiceUpdatedNotification } from "@/lib/notifications/create";
import type { MyVoiceViewModel, UserVoiceSummaryRow } from "./types";

function readyView(
  row: UserVoiceSummaryRow,
  sessionCount: number,
  refreshing?: boolean,
): MyVoiceViewModel {
  return {
    phase: "ready",
    sessionCount,
    content: row.synthesis_json,
    generatedAt: row.generated_at,
    sessionCountAtGeneration: row.session_count_at_generation,
    updatedLabel: formatMyVoiceUpdatedLabel(row.session_count_at_generation),
    refreshing,
  };
}

/**
 * Open My Voice for the authenticated owner.
 *
 * Cache-first: return a ready summary immediately when one exists.
 * Generate when missing (eligible). Soft-refresh is signaled via `refreshing`
 * so the client can update in the background without blocking the overlay.
 * Low-data users never get fabricated longitudinal analysis.
 */
export async function openMyVoiceForUser(opts: {
  userId: string;
  /** Force regeneration even if cache looks fresh. */
  forceRefresh?: boolean;
}): Promise<MyVoiceViewModel> {
  const history = await gatherMyVoiceHistory(opts.userId);
  const sessionCount = history.eligibleSessions.length;
  const phase = myVoicePhaseFromSessionCount(sessionCount);

  if (phase === "empty") {
    return { phase: "empty", sessionCount: 0 };
  }

  if (phase === "beginning") {
    return {
      phase: "beginning",
      sessionCount,
      planetCoverage: history.planetCoverage,
    };
  }

  const cached = await getOwnVoiceSummaryRow(opts.userId);
  const decision = opts.forceRefresh
    ? ({ shouldGenerate: true, reason: "missing" } as const)
    : decideMyVoiceRefresh({
        eligibleSessionCount: sessionCount,
        completedOrbitCount: history.completedOrbitCount,
        latestSessionAt: history.latestSessionAt,
        cached: cached
          ? {
              sessionCountAtGeneration: cached.session_count_at_generation,
              completedOrbitCountAtGeneration:
                cached.completed_orbit_count_at_generation,
              latestSessionAtGeneration: cached.latest_session_at_generation,
              status: cached.status,
            }
          : null,
      });

  // Force path (retry) — always regenerate when eligible.
  if (opts.forceRefresh) {
    try {
      const updated = await regenerateAndPersist(opts.userId, history);
      if (updated) {
        if (cached?.status === "ready") {
          // Refresh of an existing summary — surface in the notification center.
          void createMyVoiceUpdatedNotification(opts.userId).catch(() => {});
        }
        trackMyVoiceEvent("my_voice_updated", {
          reason: "force",
          sessionCount,
          userId: opts.userId,
        });
        trackMyVoiceEvent("my_voice_opened", {
          source: "generated",
          sessionCount,
          userId: opts.userId,
        });
        return readyView(updated, sessionCount);
      }
    } catch (err) {
      console.error("[myVoice] force refresh failed:", err);
      if (cached?.status === "ready") {
        return readyView(cached, sessionCount);
      }
      return {
        phase: "error",
        sessionCount,
        message:
          "Your voice summary isn't ready yet. Keep exploring and check back soon.",
      };
    }
  }

  if (!decision.shouldGenerate && cached?.status === "ready") {
    trackMyVoiceEvent("my_voice_opened", {
      source: "cache",
      sessionCount,
      userId: opts.userId,
    });
    return readyView(cached, sessionCount);
  }

  // Stale-but-usable cache: open immediately; client may soft-refresh.
  if (decision.shouldGenerate && cached?.status === "ready") {
    trackMyVoiceEvent("my_voice_opened", {
      source: "stale_cache",
      sessionCount,
      userId: opts.userId,
    });
    return readyView(cached, sessionCount, true);
  }

  // No cache — must generate (or fail gracefully).
  if (!history.synthesisInput) {
    return {
      phase: "error",
      sessionCount,
      message:
        "Your voice summary isn't ready yet. Keep exploring and check back soon.",
    };
  }

  try {
    const updated = await regenerateAndPersist(opts.userId, history);
    if (!updated) {
      return {
        phase: "error",
        sessionCount,
        message:
          "Your voice summary isn't ready yet. Keep exploring and check back soon.",
      };
    }
    trackMyVoiceEvent("my_voice_generated", {
      sessionCount,
      userId: opts.userId,
    });
    trackMyVoiceEvent("my_voice_opened", {
      source: "generated",
      sessionCount,
      userId: opts.userId,
    });
    return readyView(updated, sessionCount);
  } catch (err) {
    console.error("[myVoice] generation failed:", err);
    return {
      phase: "error",
      sessionCount,
      message:
        "Your voice summary isn't ready yet. Keep exploring and check back soon.",
      content: cached?.status === "ready" ? cached.synthesis_json : undefined,
      generatedAt: cached?.generated_at,
      updatedLabel: cached
        ? formatMyVoiceUpdatedLabel(cached.session_count_at_generation)
        : undefined,
    };
  }
}

async function regenerateAndPersist(
  userId: string,
  history: Awaited<ReturnType<typeof gatherMyVoiceHistory>>,
): Promise<UserVoiceSummaryRow | null> {
  if (!history.synthesisInput) return null;
  const generated = await generateMyVoiceSummaryContent(history.synthesisInput);
  return upsertOwnVoiceSummary({
    userId,
    content: generated.content,
    sessionCount: history.eligibleSessions.length,
    latestSessionAt: history.latestSessionAt,
    completedOrbitCount: history.completedOrbitCount,
    modelVersion: generated.modelVersion,
    promptVersion: generated.promptVersion,
  });
}

/** Explicit regenerate for subtle retry / background refresh. */
export async function regenerateMyVoiceForUser(
  userId: string,
): Promise<MyVoiceViewModel> {
  return openMyVoiceForUser({ userId, forceRefresh: true });
}
