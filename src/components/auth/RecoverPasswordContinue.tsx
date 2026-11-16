"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { confirmRecoveryAction } from "@/lib/auth/confirmRecoveryAction";

function ContinueButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
    >
      {pending ? "Opening…" : "Continue"}
    </button>
  );
}

export function RecoverPasswordContinue({
  tokenHash,
  next,
}: {
  tokenHash: string;
  next: string;
}) {
  return (
    <form action={confirmRecoveryAction} className="flex flex-col gap-5">
      <div>
        <h1
          className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight text-[var(--foreground)] sm:text-[2rem]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            letterSpacing: "-0.015em",
          }}
        >
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Tap continue to choose a new password.
        </p>
      </div>

      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="next" value={next} />

      <ContinueButton />

      <p className="text-center text-sm text-[var(--foreground)]">
        Link expired?{" "}
        <Link
          href="/forgot-password"
          className="halo-btn font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Request a new one
        </Link>
      </p>
    </form>
  );
}
