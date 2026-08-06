import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessionReviewClient } from "@/components/session/SessionReviewClient";
import {
  loadOwnedSession,
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { planet } = await params;
  return {
    title: "Session Review — Haelo",
    description: `Review your ${planet} practice session.`,
  };
}

export default async function SessionReviewPage({ params }: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const loaded = await loadOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return (
      <SessionNotFound
        href={loaded.kind === "invalid_planet" ? "/home" : `/${planetParam}`}
      />
    );
  }

  const { planet, session } = loaded.data;
  const hasSecond = session.session_attempts.some((a) => a.attempt_number === 2);
  if (hasSecond && session.status === "in_progress") {
    redirect(`/session/${planet}/${sessionId}/compare`);
  }

  return (
    <SessionShell planet={planet}>
      <SessionReviewClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
      />
    </SessionShell>
  );
}
