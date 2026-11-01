import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SessionReviewClient } from "@/components/session/SessionReviewClient";
import { loadGuestOwnedSession } from "@/lib/guest/loadGuestSession";
import {
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Guest practice review — Halo",
    description: "Review your guest practice session.",
  };
}

export default async function GuestSessionReviewPage({ params }: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const loaded = await loadGuestOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return (
      <SessionNotFound
        href={loaded.kind === "invalid_planet" ? "/try" : `/try`}
      />
    );
  }

  const { planet, session } = loaded.data;
  const hasSecond = session.session_attempts.some((a) => a.attempt_number === 2);
  if (hasSecond && session.status === "in_progress") {
    redirect(`/try/session/${planet}/${sessionId}/compare`);
  }

  return (
    <SessionShell planet={planet}>
      <SessionReviewClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
        guestMode
        firstStarMoment={false}
      />
    </SessionShell>
  );
}
