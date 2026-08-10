import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { OrbitCompleteClient } from "@/components/orbits/OrbitCompleteClient";
import {
  getOrbitByKey,
  getOrbitPlanetsInvolved,
} from "@/lib/orbits/catalog";
import { getUserOrbitProgress } from "@/lib/orbits/progress";
import { listOrbitProgressSessions } from "@/lib/orbits/runtime";
import { getOrbitSummativeAnalysisForProgress } from "@/lib/orbits/synthesize";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import { createClient } from "@/lib/supabase/server";
import { GamificationRevealOverlay } from "@/components/gamification/GamificationRevealOverlay";
import { getPendingGamificationReveals } from "@/lib/gamification/data";
import { processGamificationEvent } from "@/lib/gamification/process";

type PageProps = {
  params: Promise<{ orbitKey: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  return {
    title: orbit
      ? `${orbit.title} · Complete — Haelo`
      : "Orbit Complete — Haelo",
  };
}

export default async function OrbitCompletePage({ params }: PageProps) {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orbits/${orbitKey}/complete`)}`,
    );
  }

  const progress = await getUserOrbitProgress(user.id, orbitKey);
  if (!progress) {
    redirect(`/orbits/${orbitKey}`);
  }

  const sessions = await listOrbitProgressSessions(user.id, progress.id);
  const completedKeys = new Set(
    sessions
      .filter((s) => s.status === "completed" && s.orbit_question_key)
      .map((s) => s.orbit_question_key as string),
  );
  const allDone = orbit.questions.every((q) =>
    completedKeys.has(q.questionKey),
  );

  if (!allDone && progress.status !== "completed") {
    redirect(`/orbits/${orbitKey}/reflect`);
  }

  const existing = await getOrbitSummativeAnalysisForProgress(
    user.id,
    progress.id,
  );

  let analysis: OrbitSummativeAnalysisContent | null = null;
  let analysisStatus: "pending" | "ready" | "failed" | "missing" = "pending";
  let failureMessage: string | null = null;

  if (existing?.status === "ready" && existing.analysis_json) {
    analysis = existing.analysis_json as OrbitSummativeAnalysisContent;
    analysisStatus = "ready";
  } else if (existing?.status === "failed") {
    analysisStatus = "failed";
    failureMessage =
      "We're having trouble creating your final reflection. Try again.";
  } else if (!existing) {
    analysisStatus = "pending";
  } else {
    analysisStatus = "pending";
  }

  // Ensure orbit completion reward is unlocked (idempotent).
  await processGamificationEvent(supabase, user.id, {
    type: "orbit_completed",
    orbitProgressId: progress.id,
  });

  const orbitReveals = (
    await getPendingGamificationReveals(user.id, {
      priority: "immediate",
      limit: 2,
    })
  ).filter(
    (r) =>
      r.revealType === "orbit_reward" || r.revealType === "celestial_discovery",
  );

  return (
    <div className="orbits-page relative min-h-dvh w-full overflow-x-hidden">
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 z-0 opacity-45"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div
        className="orbits-page-depth pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <HomeNavWithRole  />
      <main className="relative z-10 w-full pb-28 pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-8 lg:px-12">
          <OrbitCompleteClient
            orbitKey={orbit.orbitKey}
            orbitTitle={orbit.title}
            planetsInvolved={getOrbitPlanetsInvolved(orbit)}
            analysis={analysis}
            analysisStatus={analysisStatus}
            failureMessage={failureMessage}
          />
        </div>
      </main>
      <HomeBottomNav />
      {orbitReveals.length > 0 ? (
        <GamificationRevealOverlay reveals={orbitReveals} />
      ) : null}
    </div>
  );
}
