import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { ConnectionsClient } from "@/components/connections/ConnectionsClient";
import { listMyConnections } from "@/lib/connections/data";
import { getProfessionalContext } from "@/lib/professional";
import { formatUsernameDisplay } from "@/lib/profiles/username";

export const metadata: Metadata = {
  title: "Connections — Professional — Haelo",
  description: "Connect with people on Haelo before recommending an Orbit.",
};

export default async function ProfessionalConnectionsPage() {
  const ctx = await getProfessionalContext();
  if (!ctx) {
    redirect("/login/professional?next=/professional/connections");
  }
  if (!ctx.isProfessional) {
    redirect("/home");
  }

  const connections = await listMyConnections();
  const usernameDisplay = ctx.profile.username
    ? formatUsernameDisplay(ctx.profile.username)
    : null;
  const pending = ctx.verificationStatus === "pending";

  return (
    <div className="professional-connections-page">
      <HomeNav
        showModeSwitch
        professionalUsername={usernameDisplay}
        professionalVerified={ctx.isVerified}
        professionalPending={pending}
      />
      <div className="professional-connections-page__content">
        <ConnectionsClient
          accountRole={ctx.profile.accountRole}
          ownUsername={ctx.profile.username}
          ownUserId={ctx.profile.id}
          initialConnections={connections}
          variant="professional"
          verified={ctx.isVerified}
          pendingVerification={pending}
        />
      </div>
    </div>
  );
}
