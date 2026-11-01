import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessionRetryClient } from "@/components/session/SessionRetryClient";
import { loadGuestOwnedSession } from "@/lib/guest/loadGuestSession";
import {
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
      intent === "experiment"
        ? "Try the Experiment — Halo"
        : "Try Again — Halo",
  };
}

export default async function GuestSessionRetryPage({
  params,
  searchParams,
}: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const { intent } = await searchParams;
  const loaded = await loadGuestOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return <SessionNotFound href="/try" />;
  }

  const { planet, session } = loaded.data;
  const hasSecond = session.session_attempts.some((a) => a.attempt_number === 2);
  if (hasSecond) {
    redirect(`/try/session/${planet}/${sessionId}/compare`);
  }

  return (
    <SessionShell planet={planet}>
      <SessionRetryClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
        experimentIntent={intent === "experiment"}
        guestMode
      />
    </SessionShell>
  );
}
