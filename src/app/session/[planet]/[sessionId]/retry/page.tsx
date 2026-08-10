import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessionRetryClient } from "@/components/session/SessionRetryClient";
import {
  loadOwnedSession,
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
  searchParams: Promise<{ intent?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { intent } = await searchParams;
  return {
    title:
      intent === "experiment" ? "Try the Experiment — Haelo" : "Try Again — Haelo",
  };
}

export default async function SessionRetryPage({
  params,
  searchParams,
}: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const { intent } = await searchParams;
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
  if (hasSecond) {
    redirect(`/session/${planet}/${sessionId}/compare`);
  }

  return (
    <SessionShell planet={planet}>
      <SessionRetryClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
        experimentIntent={intent === "experiment"}
      />
    </SessionShell>
  );
}
