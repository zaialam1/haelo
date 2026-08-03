"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AgeGateShell } from "@/components/auth/AgeGateShell";
import { saveParentEmailPrototype } from "@/lib/age-gate/prototype";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ParentEmailClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter a parent or guardian email.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email.");
      return;
    }

    setSubmitting(true);
    setError(undefined);
    // Prototype only — no email is sent.
    const token = saveParentEmailPrototype(trimmed);
    router.push(
      `/age-verification/pending?token=${encodeURIComponent(token)}`,
    );
  }

  return (
    <AgeGateShell eyebrow="Permission">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Under 13
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-[2rem] leading-tight sm:text-[2.25rem]"
        style={{
          fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
          letterSpacing: "-0.02em",
        }}
      >
        Ask a parent or guardian
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Enter the email of a parent or guardian. In the full product, they would
        receive a message with an approval link. For now, this step is a
        prototype — no email is sent yet.
      </p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="parent-email"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Parent or guardian email
          </label>
          <input
            id="parent-email"
            name="parentEmail"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@email.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "parent-email-error" : undefined}
            disabled={submitting}
            className="w-full rounded-2xl border-2 border-[var(--surface-border)] bg-[var(--surface)] px-4 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none focus-visible:border-[var(--violet)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]"
          />
          {error ? (
            <p id="parent-email-error" className="text-sm text-[#9B2C2C]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          {submitting ? "Continuing…" : "Send permission request"}
        </button>
      </form>

      <Link
        href="/age-verification"
        className="mt-6 inline-flex text-sm font-semibold text-[var(--violet)] underline-offset-4 hover:underline"
      >
        ← Back
      </Link>
    </AgeGateShell>
  );
}
