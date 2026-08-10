import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { RecommendOrbitClient } from "@/components/recommendations/RecommendOrbitClient";
import { ProfessionalModeNav } from "@/components/professional/ProfessionalModeNav";
import { getProfessionalContext } from "@/lib/professional";
import {
  listAcceptedConnectionsForRecommend,
  listProfessionalSentRecommendations,
} from "@/lib/recommendations";
import { formatUsernameDisplay } from "@/lib/profiles/username";

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
    redirect("/professional");
  }

  const pending = ctx.verificationStatus === "pending";
  const usernameDisplay = ctx.profile.username
    ? formatUsernameDisplay(ctx.profile.username)
    : null;

  if (!ctx.isVerified) {
    return (
      <div className="professional-shell">
        <HomeNav
          showModeSwitch
          professionalUsername={usernameDisplay}
          professionalVerified={false}
          professionalPending={pending}
        />
        <main className="professional-shell__content">
          <ProfessionalModeNav />
          <h1
            className="mt-2 text-center font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
            }}
          >
            Recommend an Orbit
          </h1>
          <section
            className="mt-8 rounded-2xl border px-5 py-6 text-center"
            style={{
              background: "color-mix(in srgb, var(--surface) 80%, transparent)",
              borderColor: "var(--hairline)",
            }}
          >
            <h2
              className="font-[family-name:var(--font-fraunces)] text-xl"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              Professional access pending
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Recommending Orbits becomes available once your professional
              account is verified. You can still explore Orbits in Personal Mode.
            </p>
            <TransitionLink
              href="/orbits"
              variant="fade"
              className="mt-5 inline-flex rounded-full border px-5 py-2.5 text-sm font-semibold text-[var(--violet)]"
              style={{ borderColor: "var(--hairline)" }}
            >
              Explore Orbits
            </TransitionLink>
          </section>
        </main>
      </div>
    );
  }

  const [connections, sent] = await Promise.all([
    listAcceptedConnectionsForRecommend(),
    listProfessionalSentRecommendations(ctx.profile.id),
  ]);

  return (
    <div className="professional-shell">
      <HomeNav
        showModeSwitch
        professionalUsername={usernameDisplay}
        professionalVerified
        professionalPending={false}
      />
      <main className="professional-shell__content">
        <ProfessionalModeNav />
        <h1
          className="mt-2 text-center font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          Recommend an Orbit
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-[var(--foreground-muted)]">
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
    </div>
  );
}
