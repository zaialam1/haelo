"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getDailyQuestionForDate } from "@/lib/questions/bank";
import { DAILY_COMPLETED_KEY } from "@/lib/home/universe";
import { TODAYS_QUESTION } from "@/lib/home/voicePlanets";
import {
  fetchStreakStats,
  type StreakStats,
} from "@/lib/home/streakStats";

type PanelId = "streak" | "daily";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function UtilityButton({
  active,
  onClick,
  ariaLabel,
  ariaControls,
  ariaExpanded,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  ariaControls: string;
  ariaExpanded: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      className="home-utility-btn flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:size-12"
      style={{
        background: active
          ? "color-mix(in srgb, var(--violet) 16%, var(--surface))"
          : "color-mix(in srgb, var(--surface) 78%, transparent)",
        border: active
          ? "1px solid color-mix(in srgb, var(--violet) 35%, transparent)"
          : "1px solid color-mix(in srgb, var(--violet) 18%, transparent)",
        boxShadow: "var(--shadow-soft)",
        color: "var(--violet)",
      }}
    >
      {children}
    </button>
  );
}

export function HomeUtilities() {
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const streakPanelId = useId();
  const dailyPanelId = useId();
  const streakTitleId = useId();
  const dailyTitleId = useId();

  const bankQuestion = getDailyQuestionForDate();
  const questionText = bankQuestion?.text ?? TODAYS_QUESTION.text;
  const streakDays = stats?.streakDays ?? 0;
  const weekActive =
    stats?.weekActive ?? [false, false, false, false, false, false, false];

  useEffect(() => {
    try {
      setDailyCompleted(localStorage.getItem(DAILY_COMPLETED_KEY) === todayKey());
    } catch {
      setDailyCompleted(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchStreakStats()
      .then((next) => {
        if (!cancelled) setStats(next);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPanel(null);
    }
    function onPointer(e: MouseEvent | TouchEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setPanel(null);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [panel]);

  function toggle(id: PanelId) {
    setPanel((prev) => (prev === id ? null : id));
  }

  const streakCopy =
    streakDays === 0
      ? "Start practicing to begin a streak — one day at a time."
      : streakDays === 1
        ? "You've practiced your voice 1 day in a row."
        : `You've practiced your voice ${streakDays} days in a row.`;

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute top-[4.5rem] left-3 z-50 flex flex-col items-start gap-2 sm:top-[5rem] sm:left-5"
    >
      <div className="flex flex-col items-center gap-2">
        <UtilityButton
          active={panel === "streak"}
          onClick={() => toggle("streak")}
          ariaLabel={
            streakDays > 0
              ? `${streakDays}-day streak — view details`
              : "View your streak"
          }
          ariaControls={streakPanelId}
          ariaExpanded={panel === "streak"}
        >
          <span className="flex items-center gap-0.5">
            <span aria-hidden="true" className="text-sm leading-none text-[var(--gold)]">
              ✦
            </span>
            <span
              className="font-[family-name:var(--font-fraunces)] text-sm tabular-nums leading-none"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              {streakDays}
            </span>
          </span>
        </UtilityButton>

        <UtilityButton
          active={panel === "daily"}
          onClick={() => toggle("daily")}
          ariaLabel={
            dailyCompleted
              ? "Today's question completed — view details"
              : "Open today's question"
          }
          ariaControls={dailyPanelId}
          ariaExpanded={panel === "daily"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
            <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
          </svg>
        </UtilityButton>
      </div>

      {/* Desktop: floating popover · Mobile: compact bottom sheet */}
      <div
        id={streakPanelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={streakTitleId}
        aria-hidden={panel !== "streak"}
        className="home-utility-panel"
        data-open={panel === "streak" ? "true" : "false"}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              id={streakTitleId}
              className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                color: "var(--foreground)",
              }}
            >
              Your Streak
            </p>
            <p
              className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl tabular-nums"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                color: "var(--violet)",
              }}
            >
              {streakDays} {streakDays === 1 ? "day" : "days"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanel(null)}
            className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          {streakCopy}
        </p>
        <div className="mt-5 flex justify-between gap-1" aria-label="This week">
          {WEEK_LABELS.map((label, i) => (
            <div key={`${label}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="text-[0.625rem] font-medium"
                style={{ color: "var(--foreground-muted)" }}
              >
                {label}
              </span>
              <span
                className="size-2.5 rounded-full"
                style={{
                  background: weekActive[i]
                    ? "var(--gold)"
                    : "color-mix(in srgb, var(--foreground-muted) 28%, transparent)",
                  boxShadow: weekActive[i]
                    ? "0 0 8px color-mix(in srgb, var(--gold) 55%, transparent)"
                    : "none",
                }}
                aria-label={
                  weekActive[i] ? `${label}: practiced` : `${label}: not yet`
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div
        id={dailyPanelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dailyTitleId}
        aria-hidden={panel !== "daily"}
        className="home-utility-panel"
        data-open={panel === "daily" ? "true" : "false"}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            id={dailyTitleId}
            className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              color: "var(--foreground)",
            }}
          >
            Today&apos;s Question
          </p>
          <button
            type="button"
            onClick={() => setPanel(null)}
            className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p
          className="mt-3 font-[family-name:var(--font-fraunces)] text-base leading-snug sm:text-lg"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 35, "WONK" 0, "wght" 500',
            color: "var(--foreground)",
          }}
        >
          &ldquo;{questionText}&rdquo;
        </p>
        {dailyCompleted ? (
          <p
            className="mt-5 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            You already answered today. A new question will be here tomorrow.
          </p>
        ) : (
          <TransitionLink
            href="/practice?from=today"
            variant="fade"
            className="mt-5 inline-flex text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--violet)" }}
            onClick={() => setPanel(null)}
          >
            Answer in 60 seconds →
          </TransitionLink>
        )}
      </div>
    </div>
  );
}
