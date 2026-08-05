import type { Metadata } from "next";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeUtilities } from "@/components/home/HomeUtilities";
import { ConversationUniverse } from "@/components/home/ConversationUniverse";

export const metadata: Metadata = {
  title: "Home — Haelo",
  description: "Explore your personal voice universe in Haelo.",
};

export default function HomePage() {
  return (
    <div className="relative h-dvh overflow-hidden">
      <ConversationUniverse />
      <HomeNav />
      <HomeUtilities />
      <HomeBottomNav />
    </div>
  );
}
