import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ProfessionalLoginForm } from "@/components/auth/ProfessionalLoginForm";

export const metadata: Metadata = {
  title: "Professional login — Haelo",
  description: "Log in to your Haelo professional account.",
};

export default function ProfessionalLoginPage() {
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
            Welcome back.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            Continue exploring Haelo — and open your Professional tools when
            you&rsquo;re ready.
          </p>
        </>
      }
    >
      <Suspense fallback={null}>
        <ProfessionalLoginForm />
      </Suspense>
    </AuthShell>
  );
}
