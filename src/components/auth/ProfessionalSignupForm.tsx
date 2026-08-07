"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { HaeloUsernameField } from "@/components/auth/HaeloUsernameField";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { finishProfessionalSignupClient } from "@/lib/professional/finishSignupClient";
import {
  PROFESSIONAL_TYPE_OPTIONS,
  type ProfessionalType,
} from "@/lib/professional/types";
import { validateUsername } from "@/lib/profiles/username";
import type { UsernameAvailabilityStatus } from "@/lib/profiles/username";
import { signIn } from "@/lib/auth/signin";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  professionalType?: string;
  username?: string;
  age?: string;
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

export function ProfessionalSignupForm() {
  const router = useRouter();
  const transition = useOptionalPageTransition();
  const formId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [professionalType, setProfessionalType] =
    useState<ProfessionalType | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailability, setUsernameAvailability] =
    useState<UsernameAvailabilityStatus>("idle");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const onAvailabilityChange = useCallback(
    (status: UsernameAvailabilityStatus) => {
      setUsernameAvailability(status);
    },
    [],
  );

  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;
  const nameId = `${formId}-name`;
  const typeId = `${formId}-type`;
  const orgId = `${formId}-org`;
  const ageId = `${formId}-age`;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    if (!password) next.password = "Enter a password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords don’t match.";
    if (!displayName.trim()) next.displayName = "Enter your name.";
    if (!professionalType) next.professionalType = "Choose your professional role.";
    const usernameParsed = validateUsername(username);
    if (!usernameParsed.ok) next.username = usernameParsed.message;
    else if (usernameAvailability !== "available") {
      next.username =
        usernameAvailability === "taken"
          ? "That Haelo name is already taken."
          : usernameAvailability === "checking"
            ? "Still checking that Haelo name…"
            : "Choose an available Haelo name.";
    }
    if (!ageConfirmed) next.age = "Confirm that you are 18 or older.";
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const usernameParsed = validateUsername(username);
    if (!usernameParsed.ok || !professionalType) return;

    setSubmitting(true);
    setErrors({});

    const finishInput = {
      displayName: displayName.trim(),
      professionalType,
      organizationName: organizationName.trim() || undefined,
      username: usernameParsed.normalized,
    };

    try {
      const supabase = createClient();
      let session = null as Awaited<
        ReturnType<typeof supabase.auth.signUp>
      >["data"]["session"];

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: displayName.trim().split(/\s+/)[0] ?? displayName.trim(),
            haelo_username: usernameParsed.normalized,
            professional_signup: true,
            professional_display_name: displayName.trim(),
            professional_type: professionalType,
            professional_organization: organizationName.trim() || null,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=/home`
              : undefined,
        },
      });

      const emailTaken =
        Boolean(error) &&
        (error!.message.toLowerCase().includes("already") ||
          error!.message.toLowerCase().includes("registered"));

      if (emailTaken) {
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
              "An account with this email already exists. Use Professional login with the same password to finish setup.",
          });
          return;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      } else if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("password")) {
          setErrors({
            password: "Use a stronger password (at least 8 characters).",
          });
        } else {
          setErrors({
            form: error.message || "Something went wrong. Try again.",
          });
        }
        return;
      } else {
        session = data.session;
      }

      if (!session) {
        setCheckEmail(true);
        return;
      }

      const finish = await finishProfessionalSignupClient(finishInput);

      if (!finish.ok) {
        setErrors({
          form: `${finish.message} You can also open Professional login to complete setup.`,
        });
        return;
      }

      const href = finish.username ? "/home" : "/onboarding/username";
      if (transition) {
        transition.navigate({ href, variant: "fade" });
      } else {
        router.push(href);
      }
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Try again.";
      setErrors({
        form: `${message} If an account was created, use Professional login to finish setup.`,
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
            className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2rem]"
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
            . After you confirm, log in with Professional login to finish setup.
          </p>
        </div>
        <TransitionLink
          href="/login/professional"
          variant="fade"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)]"
        >
          Professional login
        </TransitionLink>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div>
        <h1
          className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2rem]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            letterSpacing: "-0.015em",
          }}
        >
          Create professional account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
          Professional accounts include Haelo&rsquo;s normal voice-growth
          experience plus tools for connecting with people and recommending
          guided Orbits.
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
        <label htmlFor={emailId} className="text-sm font-semibold">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClassName(Boolean(errors.email))}
          disabled={submitting}
        />
        {errors.email ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={passwordId} className="text-sm font-semibold">
          Password
        </label>
        <div className="relative">
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClassName(Boolean(errors.password))} pr-24`}
            disabled={submitting}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[var(--violet)]"
            onClick={() => setShowPassword((v) => !v)}
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
        <label htmlFor={confirmId} className="text-sm font-semibold">
          Confirm password
        </label>
        <input
          id={confirmId}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClassName(Boolean(errors.confirmPassword))}
          disabled={submitting}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={nameId} className="text-sm font-semibold">
          Your name
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Maya Patel"
          className={inputClassName(Boolean(errors.displayName))}
          disabled={submitting}
        />
        {errors.displayName ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.displayName}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={typeId} className="text-sm font-semibold">
          Professional role
        </label>
        <select
          id={typeId}
          value={professionalType}
          onChange={(e) =>
            setProfessionalType(e.target.value as ProfessionalType | "")
          }
          className={inputClassName(Boolean(errors.professionalType))}
          disabled={submitting}
        >
          <option value="">Select a role</option>
          {PROFESSIONAL_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.professionalType ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {errors.professionalType}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={orgId} className="text-sm font-semibold">
          Organization <span className="font-normal text-[var(--foreground-muted)]">(optional)</span>
        </label>
        <input
          id={orgId}
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="School, practice, or organization"
          className={inputClassName(false)}
          disabled={submitting}
        />
      </div>

      <HaeloUsernameField
        value={username}
        onChange={setUsername}
        disabled={submitting}
        onAvailabilityChange={onAvailabilityChange}
        hint="People you connect with will see this Haelo name."
      />
      {errors.username ? (
        <p className="-mt-3 text-sm text-[#9B2C2C]" role="alert">
          {errors.username}
        </p>
      ) : null}

      <div
        className="rounded-2xl border px-4 py-4"
        style={{ borderColor: "var(--hairline)" }}
      >
        <p
          className="font-[family-name:var(--font-fraunces)] text-base"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          Confirm your age
        </p>
        <label
          htmlFor={ageId}
          className="mt-3 flex items-start gap-3 text-sm leading-relaxed"
        >
          <input
            id={ageId}
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1 size-4 rounded border-[var(--surface-border)]"
            disabled={submitting}
          />
          <span>I am 18 or older.</span>
        </label>
        {errors.age ? (
          <p className="mt-2 text-sm text-[#9B2C2C]" role="alert">
            {errors.age}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting || usernameAvailability !== "available"}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Creating account…" : "Create professional account"}
      </button>

      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Already have an account?{" "}
        <TransitionLink
          href="/login/professional"
          variant="fade"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Professional login
        </TransitionLink>
      </p>
    </form>
  );
}
