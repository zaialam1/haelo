import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const metadata: Metadata = {
  title: "Express — Haelo",
  description: "Say what you really think and feel. Practice putting your thoughts into words.",
};

export default function ExpressPage() {
  return <PlanetPage planetId="express" />;
}
