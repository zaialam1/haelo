import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { UsernameSetupForm } from "@/components/onboarding/UsernameSetupForm";
import { ensureOwnProfile } from "@/lib/profiles/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose your Halo name | Halo",
  description: "Choose the Halo name people can use to find you.",
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
          <h2
            className="font-[family-name:var(--font-fraunces)] text-[2.1rem] leading-tight sm:text-[2.45rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            One more thing: a name.
          </h2>
        </>
      }
    >
      <UsernameSetupForm nextPath="/home" />
    </AuthShell>
  );
}
