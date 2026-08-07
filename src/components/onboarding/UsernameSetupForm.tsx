"use client";

import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  claimUsernameAction,
  checkUsernameAvailabilityAction,
} from "@/lib/profiles/actions";
import {
  availabilityMessage,
  formatUsernameDisplay,
  normalizeUsername,
  validateUsername,
  type UsernameAvailabilityStatus,
} from "@/lib/profiles/username";

const DEBOUNCE_MS = 400;

export function UsernameSetupForm({
  nextPath = "/home",
}: {
  nextPath?: string;
}) {
  const router = useRouter();
  const transition = useOptionalPageTransition();
  const inputId = useId();
  const statusId = useId();
  const [raw, setRaw] = useState("");
  const [availability, setAvailability] =
    useState<UsernameAvailabilityStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const requestSeq = useRef(0);

  const normalized = normalizeUsername(raw);
  const local = normalized ? validateUsername(normalized) : null;
  const localError =
    local && !local.ok
      ? local.message
      : null;
  const localErrorCode =
    local && !local.ok ? local.error : null;

  useEffect(() => {
    if (!normalized) {
      const t = window.setTimeout(() => setAvailability("idle"), 0);
      return () => window.clearTimeout(t);
    }

    if (localErrorCode) {
      const next =
        localErrorCode === "reserved" ? "reserved" : "invalid";
      const t = window.setTimeout(() => setAvailability(next), 0);
      return () => window.clearTimeout(t);
    }

    const checkingTimer = window.setTimeout(
      () => setAvailability("checking"),
      0,
    );
    const seq = ++requestSeq.current;

    const timer = window.setTimeout(() => {
      void (async () => {
        const result = await checkUsernameAvailabilityAction(normalized);
        if (seq !== requestSeq.current) return;
        setAvailability(result.status);
      })();
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(checkingTimer);
      window.clearTimeout(timer);
    };
  }, [normalized, localErrorCode]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = validateUsername(raw);
    if (!parsed.ok) {
      setAvailability(parsed.error === "reserved" ? "reserved" : "invalid");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const result = await claimUsernameAction(parsed.normalized);
      if (!result.ok) {
        if (result.error === "taken") setAvailability("taken");
        if (result.error === "reserved") setAvailability("reserved");
        if (result.error === "invalid") setAvailability("invalid");
        setFormError(result.message);
        return;
      }

      if (transition) {
        transition.navigate({ href: nextPath, variant: "fade" });
      } else {
        router.push(nextPath);
      }
      router.refresh();
    } catch {
      setFormError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const statusMessage =
    localError ??
    availabilityMessage(
      availability,
      availability === "available" ? normalized : undefined,
    );

  const canSubmit =
    !submitting && Boolean(normalized) && availability === "available";

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
          Choose your Haelo name
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
          This is how people you choose to connect with can find you.
        </p>
      </div>

      {formError ? (
        <p
          className="rounded-2xl border-2 px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, #9B2C2C 35%, transparent)",
            backgroundColor: "color-mix(in srgb, #9B2C2C 8%, var(--background))",
            color: "#9B2C2C",
          }}
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Haelo name
        </label>
        <div
          className="flex items-center rounded-2xl border-2 bg-[var(--surface)] transition-colors focus-within:border-[var(--violet)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--violet)_25%,transparent)]"
          style={{
            borderColor:
              availability === "taken" || availability === "invalid"
                ? "#E8A0A0"
                : "var(--surface-border)",
          }}
        >
          <span
            className="pl-4 text-[0.9375rem] font-semibold"
            style={{ color: "var(--violet)" }}
            aria-hidden="true"
          >
            @
          </span>
          <input
            id={inputId}
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={raw}
            onChange={(e) => {
              setFormError(null);
              setRaw(e.target.value.replace(/^@+/, ""));
            }}
            placeholder="yourname"
            aria-invalid={
              availability === "taken" ||
              availability === "invalid" ||
              availability === "reserved"
            }
            aria-describedby={statusId}
            className="w-full bg-transparent px-2 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)]"
            disabled={submitting}
            maxLength={20}
          />
        </div>
        <p
          id={statusId}
          className="text-sm"
          style={{
            color:
              availability === "available"
                ? "var(--violet)"
                : availability === "taken" ||
                    availability === "reserved" ||
                    availability === "invalid"
                  ? "#9B2C2C"
                  : "var(--foreground-muted)",
          }}
          role={
            availability === "taken" || availability === "reserved"
              ? "alert"
              : undefined
          }
        >
          {statusMessage ??
            (normalized
              ? formatUsernameDisplay(normalized)
              : "Letters, numbers, and underscores · 3–20 characters")}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
        Your recordings, Journey, and analyses stay private.
      </p>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {submitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
