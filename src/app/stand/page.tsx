import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const metadata: Metadata = {
  title: "Stand — Haelo",
  description:
    "Speak up and stand behind what you believe. Practice opinions, boundaries, and asking for what you need.",
};

export default function StandPage() {
  return <PlanetPage planetId="stand" />;
}
