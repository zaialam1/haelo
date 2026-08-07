import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { UsernameSetupForm } from "@/components/onboarding/UsernameSetupForm";
import { ensureOwnProfile } from "@/lib/profiles/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose your Haelo name — Haelo",
  description: "Choose a unique Haelo name so trusted people can find you.",
};

export default async function UsernameOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/username");
  }

  const profile = await ensureOwnProfile();
  if (profile?.usernameNormalized) {
    redirect("/home");
  }

  return (
    <AuthShell
      brand={
        <>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Your Haelo identity
          </p>
          <h2
            className="mt-4 font-[family-name:var(--font-fraunces)] text-[2.1rem] leading-tight sm:text-[2.45rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            A name that&rsquo;s just for connections you choose.
          </h2>
          <p
            className="mt-5 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Your recordings, Journey, and analyses stay private — a Haelo name
            never opens those doors.
          </p>
        </>
      }
    >
      <UsernameSetupForm nextPath="/home" />
    </AuthShell>
  );
}
