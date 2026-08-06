import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrbitReflectionClient } from "@/components/orbits/OrbitReflectionClient";
import { OrbitSessionShell } from "@/components/orbits/OrbitSessionShell";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getUserOrbitProgress } from "@/lib/orbits/progress";
import { resolveNextOrbitReflection } from "@/lib/orbits/runtime";
import { createClient } from "@/lib/supabase/server";

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
      ? `${orbit.title} · Reflect — Haelo`
      : "Orbit Reflection — Haelo",
  };
}

export default async function OrbitReflectPage({ params }: PageProps) {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/orbits/${orbitKey}/reflect`)}`);
  }

  const progress = await getUserOrbitProgress(user.id, orbitKey);
  if (!progress || progress.status === "not_started") {
    redirect(`/orbits/${orbitKey}`);
  }

  const resolved = await resolveNextOrbitReflection(
    user.id,
    orbitKey,
    progress,
  );

  if (resolved.kind === "missing_orbit") notFound();

  if (resolved.kind === "completed") {
    redirect(`/orbits/${orbitKey}/complete`);
  }

  const { question, openSessionId, completedCount, progress: liveProgress } =
    resolved.data;

  if (openSessionId) {
    redirect(
      `/orbits/${orbitKey}/session/${openSessionId}/review`,
    );
  }

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
      location: "reflect/page.tsx:render",
      message: "OrbitReflectPage about to render OrbitReflectionClient",
      data: {
        orbitKey,
        questionKey: question.questionKey,
        planet: question.planet,
        completedCount,
        passingFlowFromPage: false,
        childIsOrbitReflectionClient: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <OrbitSessionShell planet={question.planet}>
      <OrbitReflectionClient
        orbit={orbit}
        question={question}
        progress={liveProgress}
        completedCount={completedCount}
      />
    </OrbitSessionShell>
  );
}
