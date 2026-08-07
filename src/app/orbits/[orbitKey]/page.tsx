import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
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
    <div className="orbits-page relative min-h-dvh w-full overflow-x-hidden">
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 z-0 opacity-45"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div
        className="orbits-page-depth pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <HomeNavWithRole  />
      <main className="relative z-10 w-full pb-28 pt-16 sm:pt-20">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-8 lg:px-12">
          <OrbitDetail
            orbit={orbit}
            regionTitle={region?.title ?? orbit.regionKey}
            durationLabel={formatOrbitDuration(orbit)}
            planetSequence={getOrbitPlanetSequence(orbit)}
            planetsInvolved={getOrbitPlanetsInvolved(orbit)}
            progress={progress}
            signedIn={Boolean(user)}
          />
        </div>
      </main>
      <HomeBottomNav />
    </div>
  );
}
