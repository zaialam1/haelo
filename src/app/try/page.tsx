import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuestTryClient } from "@/components/try/GuestTryClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Try Halo — guest practice",
  description:
    "Try a short Halo voice practice without an account. Create an account anytime to keep your Journey.",
};

export default async function TryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.is_anonymous) {
    redirect("/home");
  }

  let sessionsUsed = 0;
  let isRepeatGuest = false;
  if (user?.is_anonymous) {
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    sessionsUsed = count ?? 0;

    const { count: completed } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed");
    isRepeatGuest = (completed ?? 0) > 0 || sessionsUsed > 0;
  }

  return (
    <main
      className="flex min-h-dvh w-full flex-col"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 90% 0%, color-mix(in srgb, var(--rose) 35%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 100%, color-mix(in srgb, var(--gold) 35%, transparent), transparent 50%), var(--background)",
      }}
    >
      <GuestTryClient
        sessionsUsed={sessionsUsed}
        isRepeatGuest={isRepeatGuest}
      />
    </main>
  );
}
