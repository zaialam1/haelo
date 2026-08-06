"use client";

import type { TranscriptStatus } from "@/lib/sessions/types";

export type TranscriptViewerProps = {
  transcript: string | null | undefined;
  status: TranscriptStatus | null | undefined;
  className?: string;
  /** Compact height for inline expand; full for dedicated panels. */
  maxHeightClassName?: string;
};

function statusMessage(status: TranscriptStatus | null | undefined): string {
  switch (status) {
    case "pending":
    case "not_started":
      return "Transcript is being prepared.";
    case "unavailable":
      return "No transcript was captured for this recording. New recordings can capture one live in supported browsers (Chrome / Edge).";
    case "failed":
      return "Transcript couldn’t be prepared for this recording.";
    case "ready":
      return "";
    default:
      return "No transcript is available for this recording yet.";
  }
}

export function TranscriptViewer({
  transcript,
  status,
  className,
  maxHeightClassName = "max-h-48",
}: TranscriptViewerProps) {
  const readyText = transcript?.trim() ?? "";
  const isReady = status === "ready" && readyText.length > 0;

  if (isReady) {
    return (
      <div
        className={`overflow-y-auto rounded-2xl px-4 py-3 ${maxHeightClassName} ${className ?? ""}`}
        style={{
          background: "color-mix(in srgb, var(--violet) 6%, var(--surface))",
          border: "1px solid var(--hairline)",
        }}
      >
        <p
          className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground)" }}
        >
          {readyText}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl px-4 py-3 ${className ?? ""}`}
      style={{
        background: "color-mix(in srgb, var(--violet) 5%, transparent)",
        border: "1px solid var(--hairline)",
      }}
      aria-live="polite"
    >
      <p
        className="text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {statusMessage(status)}
      </p>
    </div>
  );
}
