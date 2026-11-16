import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect | Halo",
  description:
    "Practice talking with other people: being clear, open, and understood.",
};

export default async function ConnectPage() {
  return <PlanetPage planetId="connect" />;
}
