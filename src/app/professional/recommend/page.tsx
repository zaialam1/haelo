import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { RecommendOrbitClient } from "@/components/recommendations/RecommendOrbitClient";
import { getProfessionalContext } from "@/lib/professional";
import {
  listAcceptedConnectionsForRecommend,
  listProfessionalSentRecommendations,
} from "@/lib/recommendations";

export const metadata: Metadata = {
  title: "Recommend an Orbit — Haelo",
  description:
    "Recommend a guided Orbit to someone who has accepted a connection.",
};

export default async function ProfessionalRecommendPage() {
  const ctx = await getProfessionalContext();
  if (!ctx) {
    redirect("/login/professional?next=/professional/recommend");
  }
  if (!ctx.isProfessional) {
    redirect("/professional/home");
  }

  const [connections, sent] = await Promise.all([
    listAcceptedConnectionsForRecommend(),
    listProfessionalSentRecommendations(ctx.profile.id),
  ]);

  return (
    <div
      className="relative min-h-dvh"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 100% 0%, color-mix(in srgb, var(--gold) 18%, transparent), transparent 50%), var(--background)",
      }}
    >
      <HomeNav showProfessional />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-24 sm:px-6">
        <TransitionLink
          href="/professional/home"
          variant="fade"
          className="text-xs font-semibold text-[var(--violet)]"
        >
          ← Professional
        </TransitionLink>
        <h1
          className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          Recommend an Orbit
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
          Choose something that could help someone practice what they&rsquo;re
          navigating.
        </p>

        <div className="mt-8">
          <RecommendOrbitClient
            connections={connections}
            sent={sent.map((s) => ({
              id: s.id,
              orbitKey: s.orbitKey,
              purpose: s.purpose,
              createdAt: s.createdAt,
              recipientUsername: s.recipientUsername,
            }))}
          />
        </div>
      </main>
      <HomeBottomNav />
    </div>
  );
}
