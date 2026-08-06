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
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Try Again — Haelo" };
}

export default async function SessionRetryPage({ params }: PageProps) {
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
  if (hasSecond) {
    redirect(`/session/${planet}/${sessionId}/compare`);
  }

  return (
    <SessionShell planet={planet}>
      <SessionRetryClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
      />
    </SessionShell>
  );
}
