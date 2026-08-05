import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const metadata: Metadata = {
  title: "Explore — Haelo",
  description:
    "Discover what you think and what matters to you. Use your voice to explore ideas, values, and identity.",
};

export default function ExplorePage() {
  return <PlanetPage planetId="explore" />;
}
