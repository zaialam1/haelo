import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ProfessionalSignupForm } from "@/components/auth/ProfessionalSignupForm";

export const metadata: Metadata = {
  title: "Create professional account | Halo",
  description:
    "Create a Halo professional account to connect with people and recommend Orbits.",
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
            Halo for counselors, educators, and coaches.
          </h2>
        </>
      }
    >
      <ProfessionalSignupForm />
    </AuthShell>
  );
}
