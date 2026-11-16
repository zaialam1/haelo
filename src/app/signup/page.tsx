import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account | Halo",
  description: "Create a Halo account to save your sessions.",
};

export default function SignupPage() {
  return (
    <AuthShell
      brand={
        <>
          <h2
            className="font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem] lg:text-[2.85rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Practice saying it out loud.
          </h2>
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
