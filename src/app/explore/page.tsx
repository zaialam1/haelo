import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore | Halo",
  description:
    "Talk through ideas, values, and what matters to you.",
};

export default async function ExplorePage() {
  return <PlanetPage planetId="explore" />;
}
