import type { Metadata } from "next";
import { JourneyExperience } from "@/components/journey/JourneyExperience";
import { getJourneyPageData } from "@/lib/journey/data";
import type { JourneyPlanetFilter } from "@/lib/journey/types";
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

  const model = await getJourneyPageData(user?.id ?? null, {
    preview: params.preview === "1",
  });

  return (
    <JourneyExperience
      model={model}
      initialFilter={resolveFilter(params.planet)}
    />
  );
}
