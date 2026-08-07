"use client";

import { useEffect, useId, useRef, useState } from "react";
import { checkUsernameAvailabilityAction } from "@/lib/profiles/actions";
import {
  availabilityMessage,
  formatUsernameDisplay,
  normalizeUsername,
  validateUsername,
  type UsernameAvailabilityStatus,
} from "@/lib/profiles/username";

const DEBOUNCE_MS = 400;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** When availability becomes available/taken/etc. */
  onAvailabilityChange?: (status: UsernameAvailabilityStatus) => void;
  hint?: string;
};

/**
 * Shared @username field with debounced availability for signup + onboarding.
 */
export function HaeloUsernameField({
  value,
  onChange,
  disabled,
  onAvailabilityChange,
  hint = "This is how people you choose to connect with can find you.",
}: Props) {
  const inputId = useId();
  const statusId = useId();
  const [availability, setAvailability] =
    useState<UsernameAvailabilityStatus>("idle");
  const requestSeq = useRef(0);

  const normalized = normalizeUsername(value);
  const local = normalized ? validateUsername(normalized) : null;
  const localError = local && !local.ok ? local.message : null;
  const localErrorCode = local && !local.ok ? local.error : null;

  useEffect(() => {
    onAvailabilityChange?.(availability);
  }, [availability, onAvailabilityChange]);

  useEffect(() => {
    if (!normalized) {
      const t = window.setTimeout(() => setAvailability("idle"), 0);
      return () => window.clearTimeout(t);
    }

    if (localErrorCode) {
      const next = localErrorCode === "reserved" ? "reserved" : "invalid";
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

  const statusMessage =
    localError ??
    availabilityMessage(
      availability,
      availability === "available" ? normalized : undefined,
    );

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-semibold text-[var(--foreground)]"
      >
        Haelo name
      </label>
      {hint ? (
        <p className="text-xs leading-relaxed text-[var(--foreground-muted)]">
          {hint}
        </p>
      ) : null}
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
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/^@+/, ""))}
          placeholder="yourname"
          aria-invalid={
            availability === "taken" ||
            availability === "invalid" ||
            availability === "reserved"
          }
          aria-describedby={statusId}
          className="w-full bg-transparent px-2 py-3 text-[0.9375rem] text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-muted)]"
          disabled={disabled}
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
  );
}

export function isUsernameReadyToClaim(
  value: string,
  availability: UsernameAvailabilityStatus,
): boolean {
  return Boolean(normalizeUsername(value)) && availability === "available";
}
