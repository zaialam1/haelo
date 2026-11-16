import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password | Halo",
  description: "Reset your Halo password.",
};

export default function ForgotPasswordPage() {
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
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
