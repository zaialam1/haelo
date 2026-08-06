import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { SessionCompleteClient } from "@/components/session/SessionCompleteClient";
import {
  loadOwnedSession,
  SessionNotFound,
  SessionShell,
} from "@/lib/sessions/loadSessionPage";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ planet: string; sessionId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Session Complete — Haelo" };
}

export default async function SessionCompletePage({ params }: PageProps) {
  const { planet: planetParam, sessionId } = await params;
  const loaded = await loadOwnedSession(planetParam, sessionId);

  if (!loaded.ok) {
    return (
      <SessionNotFound
        href={loaded.kind === "invalid_planet" ? "/home" : `/${planetParam}`}
      />
    );
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

    revalidatePath(`/${planet}`);
    revalidatePath("/journey");
    revalidatePath("/home");
  }

  return (
    <SessionShell planet={planet}>
      <SessionCompleteClient planet={planet} alreadyInJourney />
    </SessionShell>
  );
}
