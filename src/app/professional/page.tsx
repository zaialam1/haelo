import type { Metadata } from "next";
import { HomeNav } from "@/components/home/HomeNav";
import { ProfessionalMarketing } from "@/components/professional/ProfessionalMarketing";
import { ProfessionalHomeExperience } from "@/components/professional/ProfessionalHomeExperience";
import { listMyConnections } from "@/lib/connections/data";
import { getProfessionalContext } from "@/lib/professional";
import { listProfessionalSentRecommendations } from "@/lib/recommendations";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Professional — Haelo",
  description:
    "Haelo Professional Mode — connect with people and recommend Orbits.",
};

export default async function ProfessionalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ProfessionalMarketing />;
  }

  const ctx = await getProfessionalContext();
  if (!ctx) {
    return <ProfessionalMarketing />;
  }

  if (!ctx.isProfessional) {
    return (
      <div
        className="relative min-h-dvh"
        style={{ background: "var(--background)" }}
      >
        <HomeNav />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-24 sm:px-6">
          <h1
            className="font-[family-name:var(--font-fraunces)] text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Professional Mode
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-muted)]">
            This layer is for Haelo professional accounts. Your account is a
            personal Haelo account.
          </p>
          <ProfessionalMarketing compact />
        </main>
      </div>
    );
  }

  const [connections, sent] = await Promise.all([
    listMyConnections(),
    listProfessionalSentRecommendations(ctx.profile.id),
  ]);

  const connectedCount = connections.filter((c) => c.status === "accepted").length;
  const pendingIncomingCount = connections.filter(
    (c) => c.status === "pending" && c.recipientUserId === ctx.profile.id,
  ).length;
  const pending = ctx.verificationStatus === "pending";
  const usernameDisplay = ctx.profile.username
    ? formatUsernameDisplay(ctx.profile.username)
    : null;

  return (
    <div
      className="relative flex min-h-dvh flex-1 flex-col"
      style={{ background: "var(--professional-page)" }}
    >
      <HomeNav
        showModeSwitch
        professionalUsername={usernameDisplay}
        professionalVerified={ctx.isVerified}
        professionalPending={pending}
      />
      <ProfessionalHomeExperience
        displayName={ctx.professional?.displayName ?? null}
        usernameDisplay={usernameDisplay}
        verified={ctx.isVerified}
        pending={pending}
        connectedCount={connectedCount}
        pendingIncomingCount={pendingIncomingCount}
        recentRecommendationCount={sent.length}
      />
    </div>
  );
}
