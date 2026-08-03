import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Update password — Haelo",
  description: "Choose a new password for your Haelo account.",
};

export default function UpdatePasswordPage() {
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
            Almost there
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Set a password you&rsquo;ll remember.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            After this, you can pick up where you left off.
          </p>
        </>
      }
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
