"use client";

import { useRouter } from "next/navigation";
import { setAgeGateStatus } from "@/lib/age-gate/prototype";
import { AgeGateShell } from "@/components/auth/AgeGateShell";

export function AgeVerificationClient() {
  const router = useRouter();

  function confirmThirteenPlus() {
    setAgeGateStatus("cleared_13_plus");
    router.push("/home");
  }

  function continueUnderThirteen() {
    router.push("/age-verification/parent");
  }

  return (
    <AgeGateShell eyebrow="Age check">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Before you continue
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-[2rem] leading-tight sm:text-[2.35rem]"
        style={{
          fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
          letterSpacing: "-0.02em",
        }}
      >
        Are you 13 or older?
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Haelo needs to know this so we can keep the experience appropriate.
        If you&rsquo;re under 13, we&rsquo;ll ask a parent or guardian for
        permission.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={confirmThirteenPlus}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_28%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Yes, I am 13 or older
        </button>
        <button
          type="button"
          onClick={continueUnderThirteen}
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--violet)] bg-[color-mix(in_srgb,var(--rose)_18%,var(--background))] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--rose)_30%,var(--background))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          No, I am under 13
        </button>
      </div>

      <p
        className="mt-8 text-sm leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Your recordings stay private to you. This check is only about age.
      </p>
    </AgeGateShell>
  );
}
