import type { Metadata } from "next";
import { SessionCompareClient } from "@/components/session/SessionCompareClient";
import { loadGuestOwnedSession } from "@/lib/guest/loadGuestSession";
import {
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Compare recordings — Halo" };
}

export default async function GuestSessionComparePage({ params }: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const loaded = await loadGuestOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return <SessionNotFound href="/try" />;
  }

  const { planet, session } = loaded.data;

  return (
    <SessionShell planet={planet}>
      <SessionCompareClient
        planet={planet}
        sessionId={sessionId}
        initialSession={session}
        guestMode
      />
    </SessionShell>
  );
}
