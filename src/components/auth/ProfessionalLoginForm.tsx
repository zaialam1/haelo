"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { finishProfessionalSignupClient } from "@/lib/professional/finishSignupClient";
import type { ProfessionalType } from "@/lib/professional/types";
import { resolvePostAuthPathAction } from "@/lib/auth/postAuth";
import { signIn } from "@/lib/auth/signin";

type FieldErrors = {
  email?: string;
  password?: string;
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

export function ProfessionalLoginForm() {
  const router = useRouter();
  const transition = useOptionalPageTransition();
  const searchParams = useSearchParams();
  const formId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [personalAccount, setPersonalAccount] = useState(false);

  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;

  async function finishProfessionalSession() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { kind: "error" as const, message: "Couldn’t load your account." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_role, username_normalized")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.account_role === "user") {
      return { kind: "personal" as const };
    }

    // Finish incomplete professional signup from email confirmation / partial signup.
    if (profile?.account_role !== "professional") {
      const meta = user.user_metadata ?? {};
      if (meta.professional_signup === true) {
        const displayName =
          typeof meta.professional_display_name === "string"
            ? meta.professional_display_name
            : typeof meta.first_name === "string"
              ? meta.first_name
              : "";
        const professionalType = meta.professional_type as
          | ProfessionalType
          | undefined;
        const username =
          typeof meta.haelo_username === "string"
            ? meta.haelo_username
            : undefined;
        if (displayName && professionalType) {
          await finishProfessionalSignupClient({
            displayName,
            professionalType,
            organizationName:
              typeof meta.professional_organization === "string"
                ? meta.professional_organization
                : undefined,
            username,
          });
        }
      }
    }

    const next = await resolvePostAuthPathAction(
      searchParams.get("next"),
      "/home",
    );
    return { kind: "professional" as const, next };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setErrors({});
    setPersonalAccount(false);

    try {
      const result = await signIn({
        email: email.trim(),
        password,
      });

      if (!result.ok) {
        setErrors({ form: result.message });
        return;
      }

      const finished = await finishProfessionalSession();
      if (finished.kind === "personal") {
        setPersonalAccount(true);
        return;
      }
      if (finished.kind === "error") {
        setErrors({ form: finished.message });
        return;
      }

      if (transition) {
        transition.navigate({ href: finished.next, variant: "fade" });
      } else {
        router.push(finished.next);
      }
      router.refresh();
    } catch {
      setErrors({ form: "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (personalAccount) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1
            className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2rem]"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Personal Haelo account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
            This account is a personal Haelo account. Logging in here doesn&rsquo;t
            change your account type.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (transition) transition.navigate({ href: "/home", variant: "fade" });
            else router.push("/home");
            router.refresh();
          }}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)]"
        >
          Go to Haelo
        </button>
        <TransitionLink
          href="/professional"
          variant="fade"
          className="text-center text-sm font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Learn about professional access
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
          }}
        >
          Professional login
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Sign in with your Haelo professional account.
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
            autoComplete="current-password"
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
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] disabled:opacity-70"
      >
        {submitting ? "Signing in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Need an account?{" "}
        <TransitionLink
          href="/signup/professional"
          variant="fade"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Create professional account
        </TransitionLink>
      </p>
      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Personal account?{" "}
        <TransitionLink
          href="/login"
          variant="fade"
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
        >
          Log in here
        </TransitionLink>
      </p>
    </form>
  );
}
