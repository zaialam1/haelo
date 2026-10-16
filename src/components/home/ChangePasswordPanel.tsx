"use client";

import { useId, useState } from "react";
import { updatePassword } from "@/lib/auth/account";

function inputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none transition-colors",
    "placeholder:text-[var(--foreground-muted)]",
    "focus-visible:border-[var(--violet)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]",
    hasError ? "border-[#E8A0A0]" : "border-[var(--surface-border)]",
  ].join(" ");
}

/**
 * In-app password change for signed-in users (Settings).
 * Avoids the broken /forgot-password redirect while authenticated.
 */
export function ChangePasswordPanel() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  function resetForm() {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) {
      setError("Enter a new password.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (confirmPassword !== password) {
      setError("Passwords don’t match.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updatePassword(password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      resetForm();
      setSuccess(true);
      setOpen(false);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <dt
        className="text-xs font-semibold"
        style={{ color: "var(--foreground-muted)" }}
      >
        Password
      </dt>
      <dd
        className="mt-1 text-sm leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        For security, your password isn&rsquo;t shown here.{" "}
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setSuccess(false);
            setError(null);
          }}
          className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          {open ? "Cancel" : "Change it"}
        </button>{" "}
        if you need a new one.
      </dd>

      {success ? (
        <p
          className="mt-3 rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--violet) 30%, transparent)",
            background:
              "color-mix(in srgb, var(--gold) 18%, var(--surface))",
            color: "var(--foreground)",
          }}
          role="status"
        >
          Password updated.
        </p>
      ) : null}

      {open ? (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={onSubmit}
          noValidate
        >
          {error ? (
            <p className="text-sm text-[#9B2C2C]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="relative">
            <label htmlFor={passwordId} className="sr-only">
              New password
            </label>
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (at least 8 characters)"
              className={`${inputClassName(Boolean(error))} pr-20`}
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
          <div>
            <label htmlFor={confirmId} className="sr-only">
              Confirm password
            </label>
            <input
              id={confirmId}
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={inputClassName(Boolean(error))}
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            {submitting ? "Saving…" : "Save password"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
