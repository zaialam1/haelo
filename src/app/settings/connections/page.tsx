import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConnectionsClient } from "@/components/connections/ConnectionsClient";
import { listMyConnections } from "@/lib/connections/data";
import { ensureOwnProfile } from "@/lib/profiles/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Connections — Haelo",
  description: "Manage Haelo connections with trusted professionals.",
};

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings/connections");
  }

  const profile = await ensureOwnProfile();
  if (!profile) {
    redirect("/login?next=/settings/connections");
  }

  const connections = await listMyConnections();

  return (
    <ConnectionsClient
      accountRole={profile.accountRole}
      ownUsername={profile.username}
      initialConnections={connections}
    />
  );
}
