import type { Metadata } from "next";
import { PlanetPage } from "@/components/planets/PlanetPage";

export const metadata: Metadata = {
  title: "Connect — Haelo",
  description:
    "Build confidence communicating with other people. Practice being open, clear, and understood.",
};

export default function ConnectPage() {
  return <PlanetPage planetId="connect" />;
}
