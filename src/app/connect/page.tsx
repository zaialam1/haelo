import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect — Haelo",
  description:
    "Build confidence communicating with other people. Practice being open, clear, and understood.",
};

export default async function ConnectPage() {
  return <PlanetPage planetId="connect" />;
}
