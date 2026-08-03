"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { updatePassword } from "@/lib/auth/account";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
  form?: string;
};

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none transition-colors",
    "placeholder:text-[var(--foreground-muted)]",
    "focus-visible:border-[var(--violet)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]",
    hasError ? "border-[#E8A0A0]" : "border-[var(--surface-border)]",
  ].join(" ");
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const formId = useId();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (!password) next.password = "Enter a new password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords don’t match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      const result = await updatePassword(password);
      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }
      router.push("/home");
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
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
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Then you can get back to exploring your voice.
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
          htmlFor={passwordId}
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          New password
        </label>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            className={`${inputClassName(Boolean(errors.password))} pr-24`}
            disabled={submitting}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-[var(--violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.password}
          </p>
        ) : (
          <p className="text-xs text-[var(--foreground-muted)]">
            At least 8 characters
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={confirmId}
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Confirm password
        </label>
        <input
          id={confirmId}
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={Boolean(errors.confirmPassword)}
          className={inputClassName(Boolean(errors.confirmPassword))}
          disabled={submitting}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {submitting ? "Saving…" : "Save password"}
      </button>

      <p className="text-center text-sm text-[var(--foreground)]">
        <Link
          href="/login"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Back to Log In
        </Link>
      </p>
    </form>
  );
}
