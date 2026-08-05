import type { Metadata } from "next";
import { UniverseEmptyPage } from "@/components/placeholders/UniverseEmptyPage";

export const metadata: Metadata = {
  title: "My Voice — Haelo",
  description: "Notice how your voice grows across Express, Stand, Connect, and Explore.",
};

export default function MyVoicePage() {
  return (
    <UniverseEmptyPage
      title="My Voice"
      description="Insights across Express, Stand, Connect, and Explore will gather here once you've practiced a little."
      hint="There's nothing to analyze yet — and that's okay. Start with any planet that feels right."
    />
  );
}
