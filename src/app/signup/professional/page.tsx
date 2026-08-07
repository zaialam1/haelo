import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ProfessionalSignupForm } from "@/components/auth/ProfessionalSignupForm";

export const metadata: Metadata = {
  title: "Create professional account — Haelo",
  description:
    "Create a Haelo professional account to explore Orbits and recommend guided experiences.",
};

export default function ProfessionalSignupPage() {
  return (
    <AuthShell
      brand={
        <>
          <p
            className="inline-flex rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{
              color: "var(--violet)",
              backgroundColor:
                "color-mix(in srgb, var(--gold) 45%, var(--rose) 25%, var(--background))",
            }}
          >
            Professional
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Help young people practice the conversations that matter.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            You&rsquo;ll get the full Haelo experience — plus professional tools
            for connections and Orbit recommendations.
          </p>
        </>
      }
    >
      <ProfessionalSignupForm />
    </AuthShell>
  );
}
