import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Haelo",
  description: "Log in to Haelo to continue exploring your voice.",
};

export default function LoginPage() {
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
            Welcome back
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem] lg:text-[2.85rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Your voice is still here.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed sm:text-[1.125rem]"
            style={{ color: "var(--foreground)" }}
          >
            Pick up where you left off — notice how you sound across the moments
            that make up your life.
          </p>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: "var(--violet)" }}
            />
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: "var(--rose)" }}
            />
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: "var(--gold)" }}
            />
          </div>
        </>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
