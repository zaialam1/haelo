"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { requestPasswordReset } from "@/lib/auth/account";

type FieldErrors = {
  email?: string;
  form?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none transition-colors",
    "placeholder:text-[var(--foreground-muted)]",
    "focus-visible:border-[var(--violet)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]",
    hasError ? "border-[#E8A0A0]" : "border-[var(--surface-border)]",
  ].join(" ");
}

export function ForgotPasswordForm() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      const result = await requestPasswordReset(email);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      setSent(true);
    } catch {
      setErrors({ form: "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1
            className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight text-[var(--foreground)] sm:text-[2rem]"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
              letterSpacing: "-0.015em",
            }}
          >
            Check your email
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            If an account exists for that address, we sent a link to reset your
            password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div>
        <h1
          className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight text-[var(--foreground)] sm:text-[2rem]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            letterSpacing: "-0.015em",
          }}
        >
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Enter your email and we&rsquo;ll send a reset link.
        </p>
      </div>

      {errors.form ? (
        <p
          className="rounded-2xl border-2 px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, #9B2C2C 35%, transparent)",
            backgroundColor: "color-mix(in srgb, #9B2C2C 8%, var(--background))",
            color: "#9B2C2C",
          }}
          role="alert"
        >
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClassName(Boolean(errors.email))}
          disabled={submitting}
        />
        {errors.email ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {submitting ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-[var(--foreground)]">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
