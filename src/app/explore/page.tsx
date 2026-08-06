import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore — Haelo",
  description:
    "Discover what you think and what matters to you. Use your voice to explore ideas, values, and identity.",
};

export default async function ExplorePage() {
  return <PlanetPage planetId="explore" />;
}
