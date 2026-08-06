"use client";

import { RecordingSession } from "@/components/recording/RecordingSession";
import { OrbitProgressConstellation } from "@/components/orbits/OrbitProgressConstellation";
import { orbitSessionFlow } from "@/lib/sessions/sessionFlow";
import { PLANET_LABEL } from "@/lib/orbits/ui";
import type {
  OrbitDefinition,
  OrbitQuestionDefinition,
  UserOrbitProgressRow,
} from "@/lib/orbits/types";

export function OrbitReflectionClient({
  orbit,
  question,
  progress,
  completedCount,
}: {
  orbit: OrbitDefinition;
  question: OrbitQuestionDefinition;
  progress: UserOrbitProgressRow;
  completedCount: number;
}) {
  const flow = orbitSessionFlow({
    orbitKey: orbit.orbitKey,
    planet: question.planet,
    orbitQuestionKey: question.questionKey,
    userOrbitProgressId: progress.id,
    orbitVersion: progress.orbit_version || orbit.version,
  });

  // #region agent log
  fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "965f52",
    },
    body: JSON.stringify({
      sessionId: "965f52",
      runId: "post-fix",
      hypothesisId: "A",
      location: "OrbitReflectionClient.tsx:render",
      message: "OrbitReflectionClient building flow for RecordingSession",
      data: {
        hasUseClientDirective: true,
        flowSource: flow.source,
        reviewHrefType: typeof flow.reviewHref,
        retryHrefType: typeof flow.retryHref,
        afterCompleteHrefType: typeof flow.afterCompleteHref,
        orbitKey: orbit.orbitKey,
        questionKey: question.questionKey,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <RecordingSession
      planet={question.planet}
      prompt={{ id: question.questionKey, text: question.prompt }}
      explanation={question.explanation}
      flow={flow}
      headerSlot={
        <div>
          <p
            className="text-[0.75rem] font-medium"
            style={{ color: "var(--foreground-muted)" }}
          >
            {orbit.title}
          </p>
          <div className="mt-3">
            <OrbitProgressConstellation
              current={question.sequenceNumber}
              completedCount={completedCount}
            />
          </div>
          <p
            className="mt-3 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            {PLANET_LABEL[question.planet]}
          </p>
        </div>
      }
    />
  );
}
