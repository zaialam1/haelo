"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { HaeloUsernameField } from "@/components/auth/HaeloUsernameField";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { signIn } from "@/lib/auth/signin";
import { signUp } from "@/lib/auth/signup";
import { createClient } from "@/lib/supabase/client";
import { validateUsername } from "@/lib/profiles/username";
import type { UsernameAvailabilityStatus } from "@/lib/profiles/username";

type FieldErrors = {
  firstName?: string;
  username?: string;
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
  const [username, setUsername] = useState("");
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailabilityStatus>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const onAvailabilityChange = useCallback(
    (status: UsernameAvailabilityStatus) => {
      setUsernameAvailability(status);
    },
    [],
  );

  const firstNameId = `${formId}-first-name`;
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "Enter your first name.";
    const usernameParsed = validateUsername(username);
    if (!usernameParsed.ok) next.username = usernameParsed.message;
    else if (usernameAvailability === "taken")
      next.username = "That Haelo name is already taken.";
    else if (usernameAvailability === "reserved")
      next.username = "That Haelo name isn’t available.";
    else if (
      usernameAvailability !== "available" &&
      usernameAvailability !== "idle"
    ) {
      if (usernameAvailability === "checking") {
        next.username = "Still checking that Haelo name…";
      } else if (usernameAvailability === "invalid") {
        next.username =
          "Use 3–20 letters, numbers, or underscores. Don’t start or end with an underscore.";
      }
    }
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

    void import("@/lib/analytics/track")
      .then((m) => m.trackEvent("signup_started", { accountType: "personal" }))
      .catch(() => {});

    const usernameParsed = validateUsername(username);
    if (!usernameParsed.ok || usernameAvailability !== "available") {
      setErrors({
        username:
          usernameParsed.ok === false
            ? usernameParsed.message
            : "Choose an available Haelo name.",
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    async function ensureUsernameClaimed(normalized: string): Promise<boolean> {
      const supabase = createClient();
      const { data: claimData } = await supabase.rpc("claim_username", {
        raw_username: normalized,
      });
      const payload = claimData as
        | { ok?: boolean; error?: string }
        | null;
      return Boolean(
        payload?.ok ||
          payload?.error === "already_set",
      );
    }

    function goNext(usernameClaimed: boolean) {
      // Avoid server actions right after client auth — cookie race causes
      // "An unexpected response was received from the server."
      const href = usernameClaimed
        ? "/age-verification"
        : "/onboarding/username";
      if (transition) {
        transition.navigate({ href, variant: "fade" });
      } else {
        router.push(href);
      }
      router.refresh();
    }

    try {

      const result = await signUp({
        firstName: firstName.trim(),
        username: usernameParsed.normalized,
        email: email.trim(),
        password,
      });

      if (!result.ok) {
        if (result.code === "email_taken") {
          // Auth user often already exists from a previous partial signup attempt.
          const signedIn = await signIn({
            email: email.trim(),
            password,
          });
          if (!signedIn.ok) {
            if (signedIn.code === "email_not_confirmed") {
              setCheckEmail(true);
              return;
            }
            setErrors({
              form:
                "An account with this email already exists. Log in with the same password to continue.",
            });
            return;
          }
          const claimed = await ensureUsernameClaimed(
            usernameParsed.normalized,
          );
          goNext(claimed);
          return;
        }
        if (result.code === "invalid_email") {
          setErrors({ email: result.message });
        } else if (result.code === "weak_password") {
          setErrors({ password: result.message });
        } else if (
          result.code === "username_taken" ||
          result.code === "username_reserved" ||
          result.code === "username_invalid"
        ) {
          setErrors({ username: result.message });
        } else {
          setErrors({ form: result.message });
        }
        return;
      }

      if (result.needsEmailConfirmation) {
        void import("@/lib/analytics/track")
          .then((m) =>
            m.trackEvent("signup_completed", {
              accountType: "personal",
              needsEmailConfirmation: true,
            }),
          )
          .catch(() => {});
        setCheckEmail(true);
        return;
      }

      void import("@/lib/analytics/track")
        .then((m) =>
          m.trackEvent("signup_completed", {
            accountType: "personal",
            needsEmailConfirmation: false,
          }),
        )
        .catch(() => {});
      goNext(result.usernameClaimed);
    } catch {
      setErrors({
        form:
          "Something went wrong. If an account was created, log in with the same password to continue.",
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
            . Open it to finish creating your account. Your Haelo name will be
            saved when you confirm.
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

  const canSubmit =
    !submitting && usernameAvailability === "available";

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

      <div>
        <HaeloUsernameField
          value={username}
          onChange={(value) => {
            setUsername(value);
            if (errors.username) {
              setErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          disabled={submitting}
          onAvailabilityChange={onAvailabilityChange}
        />
        {errors.username ? (
          <p className="mt-1.5 text-sm text-[#9B2C2C]" role="alert">
            {errors.username}
          </p>
        ) : null}
        <p className="mt-2 text-xs leading-relaxed text-[var(--foreground-muted)]">
          Your recordings, Journey, and analyses stay private.
        </p>
      </div>

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
        disabled={!canSubmit}
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
