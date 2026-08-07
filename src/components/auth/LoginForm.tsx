"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { resolvePostAuthPathAction } from "@/lib/auth/postAuth";
import { signIn } from "@/lib/auth/signin";

type FieldErrors = {
  email?: string;
  password?: string;
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

export function LoginForm() {
  const router = useRouter();
  const transition = useOptionalPageTransition();
  const searchParams = useSearchParams();
  const formId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Enter your password.";
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
      const result = await signIn({
        email: email.trim(),
        password,
      });

      if (!result.ok) {
        if (result.code === "invalid_email") {
          setErrors({ email: result.message });
        } else if (result.code === "invalid_credentials") {
          setErrors({ form: result.message });
        } else {
          setErrors({ form: result.message });
        }
        return;
      }

      const next = await resolvePostAuthPathAction(
        searchParams.get("next"),
        "/home",
      );
      if (transition) {
        transition.navigate({ href: next, variant: "fade" });
      } else {
        router.push(next);
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Log in to continue exploring your voice.
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

      <Field id={emailId} label="Email" error={errors.email}>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          className={inputClassName(Boolean(errors.email))}
          disabled={submitting}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={passwordId}
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Password
          </label>
          <TransitionLink
            href="/forgot-password"
            variant="fade"
            className="text-xs font-medium text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Forgot password?
          </TransitionLink>
        </div>
        <div className="relative">
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? `${passwordId}-error` : undefined
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
        {errors.password ? (
          <p id={`${passwordId}-error`} className="text-sm text-[#9B2C2C]" role="alert">
            {errors.password}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {submitting ? "Logging in…" : "Log In"}
      </button>

      <p className="text-center text-sm text-[var(--foreground)]">
        Don&rsquo;t have an account?{" "}
        <TransitionLink
          href="/signup"
          variant="fade"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Create an account
        </TransitionLink>
      </p>

      <p className="text-center text-sm text-[var(--foreground-muted)]">
        <TransitionLink
          href="/login/professional"
          variant="fade"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Professional login
        </TransitionLink>
      </p>
    </form>
  );
}
