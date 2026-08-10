import type { Metadata } from "next";
import { PageView } from "@/components/analytics/PageView";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { IntroMoment } from "@/components/onboarding/IntroMoment";
import { OrbitsExperience } from "@/components/orbits/OrbitsExperience";
import { getOnboardingSnapshot } from "@/lib/onboarding/data";
import { ORBIT_REGIONS, isOrbitRegionKey } from "@/lib/orbits/regions";
import { buildOrbitList } from "@/lib/orbits/progress";
import type { OrbitRegionKey } from "@/lib/orbits/types";
import { hasSeenMilestone } from "@/lib/preferences/types";
import { listRecipientActiveRecommendations } from "@/lib/recommendations";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Orbits — Haelo",
  description:
    "Choose an Orbit to work through a real situation one reflection at a time.",
};

type OrbitsPageProps = {
  searchParams: Promise<{ region?: string }>;
};

export default async function OrbitsPage({ searchParams }: OrbitsPageProps) {
  const params = await searchParams;
  const initialRegion: OrbitRegionKey | null =
    params.region && isOrbitRegionKey(params.region) ? params.region : null;

  let items: Awaited<ReturnType<typeof buildOrbitList>> = [];
  let recommendations: Awaited<
    ReturnType<typeof listRecipientActiveRecommendations>
  > = [];
  let loadError: string | null = null;
  let showIntro = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    items = await buildOrbitList({
      userId: user?.id ?? null,
    });
    if (user?.id) {
      recommendations = await listRecipientActiveRecommendations(user.id);
      const onboarding = await getOnboardingSnapshot(user.id);
      showIntro = !hasSeenMilestone(
        onboarding.preferences,
        "orbits_discovered",
      );
    }
  } catch (err) {
    console.error("[orbits] browse load failed:", err);
    loadError = "progress_unavailable";
    try {
      items = await buildOrbitList({ userId: null });
    } catch {
      items = [];
    }
  }

  return (
    <div className="orbits-page relative min-h-dvh w-full overflow-x-hidden">
      <PageView event="orbits_opened" />
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 z-0 opacity-40"
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
        <header className="mb-5 max-w-xl px-4 sm:mb-6 sm:px-8 lg:px-12">
          <h1
            className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{
              color: "var(--foreground)",
              fontVariationSettings:
                '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
            }}
          >
            Orbits
          </h1>
          <p
            className="mt-2.5 text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Sometimes you come to Haelo to grow.
            <br className="hidden sm:block" />{" "}
            Sometimes you come because something is happening right now.
          </p>
          <p
            className="mt-1.5 text-[0.8125rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Choose an Orbit to work through a situation one reflection at a
            time.
          </p>
        </header>

        {showIntro ? (
          <div className="max-w-xl px-4 sm:px-8 lg:px-12">
            <IntroMoment
              milestone="orbits_discovered"
              title="Orbits are guided reflections for something specific."
              body="A conversation you're dreading, a decision you're circling — pick one and work through it a few minutes at a time."
            />
          </div>
        ) : null}

        <OrbitsExperience
          regions={ORBIT_REGIONS}
          items={items}
          initialRegion={initialRegion}
          loadError={loadError}
          recommendations={recommendations}
        />
      </main>

      <HomeBottomNav />
    </div>
  );
}
