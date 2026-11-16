import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Express | Halo",
  description: "Express practice in Halo.",
};

export default async function ExpressPage() {
  return <PlanetPage planetId="express" />;
}
