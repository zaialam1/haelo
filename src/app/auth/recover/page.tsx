import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RecoverPasswordContinue } from "@/components/auth/RecoverPasswordContinue";
import { safeNextPath } from "@/lib/auth/paths";
import { PASSWORD_UPDATE_PATH } from "@/lib/auth/passwordReset";

export const metadata: Metadata = {
  title: "Reset password | Halo",
  description: "Continue to choose a new Halo password.",
};

export default async function RecoverPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || "";
  const next = safeNextPath(params.next, PASSWORD_UPDATE_PATH);

  if (!tokenHash || (params.type && params.type !== "recovery")) {
    redirect("/auth/error?reason=recovery");
  }

  return (
    <AuthShell
      brand={
        <>
          <h2
            className="font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            Almost there.
          </h2>
        </>
      }
    >
      <RecoverPasswordContinue tokenHash={tokenHash} next={next} />
    </AuthShell>
  );
}
