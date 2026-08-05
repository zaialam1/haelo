"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { signUp } from "@/lib/auth/signup";

type FieldErrors = {
  firstName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--foreground)]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-sm text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none transition-colors",
    "placeholder:text-[var(--foreground-muted)]",
    "focus-visible:border-[var(--violet)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]",
    hasError
      ? "border-[#E8A0A0]"
      : "border-[var(--surface-border)]",
  ].join(" ");
}

export function SignupForm() {
  const router = useRouter();
  const transition = useOptionalPageTransition();
  const formId = useId();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const firstNameId = `${formId}-first-name`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "Enter your first name.";
    if (!email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Enter a password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords don’t match.";
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});

    try {
      const result = await signUp({
        firstName: firstName.trim(),
        email: email.trim(),
        password,
      });

      if (!result.ok) {
        if (result.code === "invalid_email") {
          setErrors({ email: result.message });
        } else if (result.code === "weak_password") {
          setErrors({ password: result.message });
        } else if (result.code === "email_taken") {
          setErrors({ email: result.message });
        } else {
          setErrors({ form: result.message });
        }
        return;
      }

      if (result.needsEmailConfirmation) {
        setCheckEmail(true);
        return;
      }

      if (transition) {
        transition.navigate({ href: "/age-verification", variant: "fade" });
      } else {
        router.push("/age-verification");
      }
      router.refresh();
    } catch {
      setErrors({
        form: "Something went wrong. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (checkEmail) {
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
            We sent a confirmation link to{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {email.trim().toLowerCase()}
            </span>
            . Open it to finish creating your account.
          </p>
        </div>
        <TransitionLink
          variant="fade"
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Back to Log In
        </TransitionLink>
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
          Create your account
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          It only takes a minute.
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

      <Field id={firstNameId} label="First name" error={errors.firstName}>
        <input
          id={firstNameId}
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Alex"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
          className={inputClassName(Boolean(errors.firstName))}
          disabled={submitting}
        />
      </Field>

      <Field id={emailId} label="Email" error={errors.email}>
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
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={inputClassName(Boolean(errors.email))}
          disabled={submitting}
        />
      </Field>

      <Field id={passwordId} label="Password" error={errors.password}>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? `${passwordId}-error` : `${passwordId}-hint`
            }
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
        {!errors.password ? (
          <p
            id={`${passwordId}-hint`}
            className="text-xs text-[var(--foreground-muted)]"
          >
            At least 8 characters
          </p>
        ) : null}
      </Field>

      <Field
        id={confirmId}
        label="Confirm password"
        error={errors.confirmPassword}
      >
        <div className="relative">
          <input
            id={confirmId}
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? `${confirmId}-error` : undefined
            }
            className={`${inputClassName(Boolean(errors.confirmPassword))} pr-24`}
            disabled={submitting}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-[var(--violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={
              showConfirm ? "Hide confirm password" : "Show confirm password"
            }
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs leading-relaxed text-[var(--foreground-muted)]">
        By creating an account, you agree to the{" "}
        <TransitionLink
          variant="fade"
          href="/terms"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Terms
        </TransitionLink>{" "}
        and{" "}
        <TransitionLink
          variant="fade"
          href="/privacy"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Privacy Policy
        </TransitionLink>
        .
      </p>

      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Your recordings stay private to you.
      </p>

      <p className="text-center text-sm text-[var(--foreground)]">
        Already have an account?{" "}
        <TransitionLink
          variant="fade"
          href="/login"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Log in
        </TransitionLink>
      </p>
    </form>
  );
}
