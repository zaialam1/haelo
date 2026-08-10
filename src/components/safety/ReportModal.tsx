"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { submitReportAction } from "@/lib/safety/actions";
import {
  REPORT_REASONS,
  type ReportObjectType,
  type ReportReason,
} from "@/lib/safety/types";

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername?: string | null;
  objectType: ReportObjectType;
  objectId?: string | null;
};

function ReportForm({
  onClose,
  reportedUserId,
  reportedUsername,
  objectType,
  objectId,
}: Omit<ReportModalProps, "open">) {
  const titleId = useId();
  const firstFocusRef = useRef<HTMLInputElement | null>(null);
  const [reason, setReason] = useState<ReportReason>("unwanted_contact");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => firstFocusRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitReportAction({
        reportedUserId,
        objectType,
        objectId,
        reason,
        details,
      });
      if (!result.ok) {
        setError(result.message ?? "Couldn’t submit this report.");
        return;
      }
      setDone(true);
    });
  }

  return (
    <div
      className="relative z-10 w-full max-w-md rounded-3xl px-5 py-5 shadow-[var(--shadow-soft)]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        Report
        {reportedUsername ? ` ${reportedUsername}` : ""}
      </h2>
      <p
        className="mt-1 text-[0.8125rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Reports help keep Haelo safe. The other person won&apos;t see this.
      </p>

      {done ? (
        <div className="mt-5">
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            Thank you. We received your report.
          </p>
          <button
            type="button"
            className="haelo-btn mt-4 w-full rounded-full bg-[var(--violet)] px-4 py-2.5 text-sm font-semibold text-[var(--on-violet)]"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      ) : (
        <>
          <fieldset className="mt-4 space-y-2">
            <legend className="sr-only">Reason</legend>
            {REPORT_REASONS.map((r, index) => (
              <label
                key={r.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm"
                style={{
                  background:
                    reason === r.value
                      ? "color-mix(in srgb, var(--violet) 12%, transparent)"
                      : "transparent",
                }}
              >
                <input
                  ref={index === 0 ? firstFocusRef : undefined}
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                <span style={{ color: "var(--foreground)" }}>{r.label}</span>
              </label>
            ))}
          </fieldset>

          <label className="mt-4 block">
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--foreground-muted)" }}
            >
              Optional details
            </span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full resize-none rounded-2xl px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)]"
              style={{
                background: "var(--background)",
                border: "1px solid var(--hairline)",
                color: "var(--foreground)",
              }}
            />
          </label>

          {error ? (
            <p
              className="mt-3 text-sm"
              style={{ color: "#9B2C2C" }}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="haelo-btn flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold"
              style={{
                borderColor: "var(--hairline)",
                color: "var(--foreground)",
              }}
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="haelo-btn flex-1 rounded-full bg-[var(--violet)] px-4 py-2.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-70"
              onClick={submit}
              disabled={pending}
            >
              {pending ? "Sending…" : "Submit report"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportModal({
  open,
  onClose,
  reportedUserId,
  reportedUsername,
  objectType,
  objectId = null,
}: ReportModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_28%,transparent)]"
        aria-label="Close report dialog"
        onClick={onClose}
      />
      <ReportForm
        key={`${reportedUserId}-${objectType}-${objectId ?? "none"}`}
        onClose={onClose}
        reportedUserId={reportedUserId}
        reportedUsername={reportedUsername}
        objectType={objectType}
        objectId={objectId}
      />
    </div>
  );
}
