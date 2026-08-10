import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrbitSessionShell } from "@/components/orbits/OrbitSessionShell";
import { SessionRetryClient } from "@/components/session/SessionRetryClient";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getSessionDetailForUser } from "@/lib/sessions/getSession";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ orbitKey: string; sessionId: string }>;
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

export default async function OrbitSessionRetryPage({
  params,
  searchParams,
}: PageProps) {
  const { orbitKey, sessionId } = await params;
  const { intent } = await searchParams;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/orbits/${orbitKey}/session/${sessionId}/retry`)}`,
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

  return (
    <OrbitSessionShell planet={session.planet}>
      <SessionRetryClient
        planet={session.planet}
        sessionId={sessionId}
        initialSession={session}
        orbitKey={orbitKey}
        experimentIntent={intent === "experiment"}
      />
    </OrbitSessionShell>
  );
}
