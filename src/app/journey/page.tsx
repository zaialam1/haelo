import type { Metadata } from "next";
import { PageView } from "@/components/analytics/PageView";
import { JourneyExperience } from "@/components/journey/JourneyExperience";
import { IntroMoment } from "@/components/onboarding/IntroMoment";
import { getJourneyPageData } from "@/lib/journey/data";
import type { JourneyPlanetFilter } from "@/lib/journey/types";
import { getOnboardingSnapshot } from "@/lib/onboarding/data";
import { hasSeenMilestone } from "@/lib/preferences/types";
import { isPlanet } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Journey — Haelo",
  description:
    "Your constellation of speaking sessions across Express, Stand, Connect, and Explore.",
};

type JourneyPageProps = {
  searchParams: Promise<{ planet?: string; preview?: string }>;
};

function resolveFilter(planet?: string): JourneyPlanetFilter {
  if (planet && isPlanet(planet)) return planet;
  return "all";
}

export default async function JourneyPage({ searchParams }: JourneyPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [model, onboarding] = await Promise.all([
    getJourneyPageData(user?.id ?? null, {
      preview: params.preview === "1",
    }),
    user ? getOnboardingSnapshot(user.id) : Promise.resolve(null),
  ]);

  const showIntro = Boolean(
    onboarding &&
      !hasSeenMilestone(onboarding.preferences, "journey_discovered"),
  );

  return (
    <div className="relative">
      <PageView event="journey_opened" />
      <JourneyExperience
        model={model}
        initialFilter={resolveFilter(params.planet)}
      />
      {showIntro ? (
        <div className="pointer-events-none absolute inset-x-0 top-20 z-40 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-md">
            <IntroMoment
              milestone="journey_discovered"
              title="This is your Journey."
              body="Every reflection becomes a star here — a quiet record of your voice over time. Tap a star to revisit it."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
