import type { Metadata } from "next";
import { HomeNav } from "@/components/home/HomeNav";
import { ConversationUniverse } from "@/components/home/ConversationUniverse";
import { DailyPromptCard } from "@/components/home/DailyPromptCard";
import { StartSpeakingFAB } from "@/components/home/StartSpeakingFAB";

export const metadata: Metadata = {
  title: "Home — Haelo",
  description: "Explore your living conversation universe in Haelo.",
};

export default function HomePage() {
  return (
    <div className="relative h-dvh overflow-hidden">
      <ConversationUniverse />

      <div className="relative z-40">
        <HomeNav />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[5.5rem] sm:px-6 sm:pb-28">
        <div className="pointer-events-auto mx-auto max-w-lg">
          <DailyPromptCard />
        </div>
      </div>

      <StartSpeakingFAB />
    </div>
  );
}
