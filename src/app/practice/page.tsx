import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UniverseEmptyPage } from "@/components/placeholders/UniverseEmptyPage";
import { isPlanet } from "@/lib/prompts";

export const metadata: Metadata = {
  title: "Practice — Haelo",
  description: "Choose a planet and start a guided voice session.",
};

type PracticePageProps = {
  searchParams: Promise<{ planet?: string }>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const { planet } = await searchParams;

  if (planet && isPlanet(planet)) {
    redirect(`/speak?planet=${planet}`);
  }

  return (
    <UniverseEmptyPage
      title="Practice My Voice"
      description="Choose a planet to practice — Express, Stand, Connect, or Explore — and start a guided voice session."
    />
  );
}
