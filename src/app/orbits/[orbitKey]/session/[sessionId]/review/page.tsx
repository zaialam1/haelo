import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrbitProgressConstellation } from "@/components/orbits/OrbitProgressConstellation";
import { OrbitSessionShell } from "@/components/orbits/OrbitSessionShell";
import { SessionReviewClient } from "@/components/session/SessionReviewClient";
import { getOrbitByKey, getOrbitQuestionByKey } from "@/lib/orbits/catalog";
import { getSessionDetailForUser } from "@/lib/sessions/getSession";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ orbitKey: string; sessionId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  return {
    title: orbit
      ? `${orbit.title} · Review — Haelo`
      : "Orbit Review — Haelo",
  };
}

export default async function OrbitSessionReviewPage({ params }: PageProps) {
  const { orbitKey, sessionId } = await params;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orbits/${orbitKey}/session/${sessionId}/review`)}`,
    );
  }

  const session = await getSessionDetailForUser(sessionId, user.id);
  if (
    !session ||
    session.source !== "orbit" ||
    session.orbit_key !== orbitKey
  ) {
    notFound();
  }

  const question = session.orbit_question_key
    ? getOrbitQuestionByKey(session.orbit_question_key)
    : undefined;

  const hasSecond = session.session_attempts.some((a) => a.attempt_number === 2);
  if (hasSecond && session.status === "in_progress") {
    redirect(`/orbits/${orbitKey}/session/${sessionId}/compare`);
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
      hypothesisId: "B",
      location: "orbit/session/review/page.tsx:render",
      message: "Orbit review page passing serializable orbitKey (not flow)",
      data: {
        orbitKey,
        sessionId,
        passingFlowFromServer: false,
        passingOrbitKey: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const completedCount = question ? question.sequenceNumber - 1 : 0;

  return (
    <OrbitSessionShell planet={session.planet}>
      {question ? (
        <div className="mb-6">
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
        </div>
      ) : null}
      <SessionReviewClient
        planet={session.planet}
        sessionId={sessionId}
        initialSession={session}
        orbitKey={orbitKey}
      />
    </OrbitSessionShell>
  );
}
