import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNav } from "@/components/home/HomeNav";
import { OrbitDetail } from "@/components/orbits/OrbitDetail";
import {
  formatOrbitDuration,
  getOrbitByKey,
  getOrbitPlanetSequence,
  getOrbitPlanetsInvolved,
} from "@/lib/orbits/catalog";
import { getOrbitRegion } from "@/lib/orbits/regions";
import { getUserOrbitProgress } from "@/lib/orbits/progress";
import { createClient } from "@/lib/supabase/server";

type OrbitDetailPageProps = {
  params: Promise<{ orbitKey: string }>;
};

export async function generateMetadata({
  params,
}: OrbitDetailPageProps): Promise<Metadata> {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  return {
    title: orbit ? `${orbit.title} — Orbits — Haelo` : "Orbit — Haelo",
    description: orbit?.shortDescription,
  };
}

export default async function OrbitDetailPage({ params }: OrbitDetailPageProps) {
  const { orbitKey } = await params;
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) notFound();

  const region = getOrbitRegion(orbit.regionKey);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const progress = user
    ? await getUserOrbitProgress(user.id, orbit.orbitKey)
    : null;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 40% 0%, color-mix(in srgb, var(--violet) 20%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <HomeNav />
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-28 pt-20 sm:px-6">
        <OrbitDetail
          orbit={orbit}
          regionTitle={region?.title ?? orbit.regionKey}
          durationLabel={formatOrbitDuration(orbit)}
          planetSequence={getOrbitPlanetSequence(orbit)}
          planetsInvolved={getOrbitPlanetsInvolved(orbit)}
          progress={progress}
          signedIn={Boolean(user)}
        />
      </main>
      <HomeBottomNav />
    </div>
  );
}
