import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stand | Halo",
  description:
    "Practice opinions, boundaries, and asking for what you need.",
};

export default async function StandPage() {
  return <PlanetPage planetId="stand" />;
}
