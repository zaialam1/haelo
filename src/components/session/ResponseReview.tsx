"use client";

import { useState } from "react";
import { SessionAudioPlayer } from "@/components/session/SessionAudioPlayer";
import { TranscriptViewer } from "@/components/session/TranscriptViewer";
import type { TranscriptStatus } from "@/lib/sessions/types";

export type ResponseReviewProps = {
  storagePath?: string | null;
  src?: string | null;
  durationSeconds?: number | null;
  transcript: string | null | undefined;
  transcriptStatus: TranscriptStatus | null | undefined;
  accentColor?: string;
  label?: string;
  className?: string;
};

type ReviewTab = "recording" | "transcript";

/**
 * Play recording and Transcript side-by-side as closely related review modes.
 */
export function ResponseReview({
  storagePath,
  src,
  durationSeconds,
  transcript,
  transcriptStatus,
  accentColor = "var(--violet)",
  label = "Your response",
  className,
}: ResponseReviewProps) {
  const [tab, setTab] = useState<ReviewTab>("recording");

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={`${label} review`}
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recording"}
          onClick={() => setTab("recording")}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background:
              tab === "recording"
                ? `color-mix(in srgb, ${accentColor} 26%, var(--surface))`
                : "color-mix(in srgb, var(--violet) 8%, transparent)",
            color: "var(--foreground)",
          }}
        >
          <span aria-hidden="true">▶</span>
          Play Recording
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "transcript"}
          onClick={() => setTab("transcript")}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background:
              tab === "transcript"
                ? `color-mix(in srgb, ${accentColor} 26%, var(--surface))`
                : "color-mix(in srgb, var(--violet) 8%, transparent)",
            color: "var(--foreground)",
          }}
        >
          Transcript
        </button>
      </div>

      <div className="mt-4" role="tabpanel">
        {tab === "recording" ? (
          <SessionAudioPlayer
            storagePath={storagePath}
            src={src}
            label={label}
            accentColor={accentColor}
            durationHintSeconds={durationSeconds}
          />
        ) : (
          <TranscriptViewer
            transcript={transcript}
            status={transcriptStatus}
          />
        )}
      </div>
    </div>
  );
}
