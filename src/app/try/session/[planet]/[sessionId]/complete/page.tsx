import type { Metadata } from "next";
import { GuestCompleteClient } from "@/components/try/GuestCompleteClient";
import { loadGuestOwnedSession } from "@/lib/guest/loadGuestSession";
import {
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Guest practice complete — Halo" };
}

export default async function GuestSessionCompletePage({ params }: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const loaded = await loadGuestOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return <SessionNotFound href="/try" />;
  }

  const { planet, session, userId } = loaded.data;

  if (session.status !== "completed") {
    const supabase = await createClient();
    await supabase
      .from("sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("user_id", userId);
    // Intentionally no gamification / Stardust for guests.
  }

  return (
    <SessionShell planet={planet}>
      <GuestCompleteClient planet={planet} />
    </SessionShell>
  );
}
