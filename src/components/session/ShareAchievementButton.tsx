"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const DEFAULT_SHARE_URL = "https://haelo-six.vercel.app";

export type ShareAchievementButtonProps = {
  /** Short label for what was completed, e.g. a planet name or Orbit title */
  achievementLabel: string;
  /** Optional prompt / question text to include in the share message */
  promptText?: string | null;
  shareUrl?: string;
  className?: string;
};

function buildShareText(args: {
  achievementLabel: string;
  promptText?: string | null;
  shareUrl: string;
}): { title: string; text: string; url: string } {
  const title = "I practiced on Haelo";
  const prompt =
    args.promptText?.trim() && args.promptText.trim().length > 0
      ? args.promptText.trim()
      : null;

  const body = prompt
    ? `I just finished a Haelo reflection — “${prompt}” — in ${args.achievementLabel}. Want to try speaking one too?`
    : `I just finished a Haelo reflection in ${args.achievementLabel}. Want to try speaking one too?`;

  return {
    title,
    text: `${body}\n${args.shareUrl}`,
    url: args.shareUrl,
  };
}

export function ShareAchievementButton({
  achievementLabel,
  promptText,
  shareUrl = DEFAULT_SHARE_URL,
  className,
}: ShareAchievementButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle",
  );

  async function handleShare() {
    const payload = buildShareText({
      achievementLabel,
      promptText,
      shareUrl,
    });

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
        setStatus("shared");
        trackEvent("session_share_clicked", {
          method: "native",
          surface: "achievement",
        });
        return;
      }

      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(payload.text);
        setStatus("copied");
        trackEvent("session_share_clicked", {
          method: "clipboard",
          surface: "achievement",
        });
        window.setTimeout(() => setStatus("idle"), 2500);
        return;
      }

      setStatus("error");
    } catch (error) {
      // User cancelled the share sheet — treat as no-op.
      if (
        error instanceof DOMException &&
        (error.name === "AbortError" || error.name === "NotAllowedError")
      ) {
        return;
      }
      setStatus("error");
    }
  }

  const label =
    status === "copied"
      ? "Link copied"
      : status === "shared"
        ? "Shared"
        : status === "error"
          ? "Couldn’t share — try again"
          : "Share with a friend";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleShare()}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:w-auto"
        style={{
          background: "var(--gold)",
          color: "var(--foreground)",
        }}
      >
        <ShareIcon />
        {label}
      </button>
      <p
        className="mt-2 text-[0.8125rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Celebrate finishing this question — invite a friend to try Haelo.
      </p>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v12M12 3l4.5 4.5M12 3 7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
