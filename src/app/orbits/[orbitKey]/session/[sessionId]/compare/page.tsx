import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrbitSessionShell } from "@/components/orbits/OrbitSessionShell";
import { SessionCompareClient } from "@/components/session/SessionCompareClient";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getSessionDetailForUser } from "@/lib/sessions/getSession";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ orbitKey: string; sessionId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Hear the Difference — Haelo" };
}

export default async function OrbitSessionComparePage({ params }: PageProps) {
  const { orbitKey, sessionId } = await params;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orbits/${orbitKey}/session/${sessionId}/compare`)}`,
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

  if (session.status === "completed") {
    redirect(`/orbits/${orbitKey}/reflect`);
  }

  const hasSecond = session.session_attempts.some((a) => a.attempt_number === 2);
  if (!hasSecond) {
    redirect(`/orbits/${orbitKey}/session/${sessionId}/review`);
  }

  return (
    <OrbitSessionShell planet={session.planet}>
      <SessionCompareClient
        planet={session.planet}
        sessionId={sessionId}
        initialSession={session}
        orbitKey={orbitKey}
      />
    </OrbitSessionShell>
  );
}
