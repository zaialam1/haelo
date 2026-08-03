import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account — Haelo",
  description: "Create your Haelo account to start noticing how your voice changes across your life.",
};

export default function SignupPage() {
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
            Welcome
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem] lg:text-[2.85rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Start discovering your voice.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed sm:text-[1.125rem]"
            style={{ color: "var(--foreground)" }}
          >
            Create an account to notice how you sound across school, friends,
            home, and more — and how that evolves over time.
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
      <SignupForm />
    </AuthShell>
  );
}
