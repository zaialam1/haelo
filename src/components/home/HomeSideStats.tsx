"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  formatDisplayDate,
  getDailyQuestionForDate,
} from "@/lib/questions/bank";
import { getTopicById, DAILY_COMPLETED_KEY } from "@/lib/home/universe";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import {
  fetchStreakStats,
  type StreakStats,
} from "@/lib/home/streakStats";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function Sheet({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setMounted(true);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open && mounted) {
      const t = window.setTimeout(() => setMounted(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 220ms ease",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-md rounded-3xl px-6 py-6 sm:mb-0 sm:px-7 sm:py-7"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-soft)",
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition:
            "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function HomeSideStats() {
  const [streakOpen, setStreakOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const streakTitleId = useId();
  const dailyTitleId = useId();

  const question = getDailyQuestionForDate();
  const topic =
    getTopicById(question.topicId) ?? getVoicePlanetById(question.topicId);
  const streakDays = stats?.streakDays ?? 0;

  useEffect(() => {
    try {
      setDailyCompleted(localStorage.getItem(DAILY_COMPLETED_KEY) === todayKey());
    } catch {
      setDailyCompleted(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingStats(true);
      const next = await fetchStreakStats();
      if (!cancelled) {
        setStats(next);
        setLoadingStats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [streakOpen, dailyOpen]);

  return (
    <>
      <div className="pointer-events-auto absolute top-[4.75rem] left-3 z-30 flex w-12 flex-col items-center sm:top-[5.25rem] sm:left-5 sm:w-14">
        <button
          type="button"
          onClick={() => setStreakOpen(true)}
          className="flex w-full flex-col items-center gap-1 rounded-2xl py-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          aria-label={`${streakDays}-day streak — view details`}
        >
          <span
            className="flex size-9 items-center justify-center rounded-full sm:size-10"
            style={{
              background:
                "color-mix(in srgb, var(--gold) 42%, var(--surface))",
              border:
                "1px solid color-mix(in srgb, var(--gold) 55%, transparent)",
              boxShadow: "var(--shadow-soft)",
              color: "var(--violet)",
            }}
            aria-hidden="true"
          >
            {streakDays > 0 ? (
              <span
                className="font-[family-name:var(--font-fraunces)] text-sm font-semibold leading-none sm:text-[0.9375rem]"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                }}
              >
                {streakDays}
              </span>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
              </svg>
            )}
          </span>
          <span
            className="text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Streak
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDailyOpen(true)}
          className="mt-2 flex w-full flex-col items-center gap-1 rounded-2xl py-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          aria-label={
            dailyCompleted
              ? "Daily question completed — view details"
              : "Open today’s daily question"
          }
        >
          <span
            className="flex size-9 items-center justify-center rounded-full sm:size-10"
            style={{
              background: dailyCompleted
                ? "color-mix(in srgb, var(--gold) 35%, var(--surface))"
                : "color-mix(in srgb, var(--rose) 40%, var(--surface))",
              border:
                "1px solid color-mix(in srgb, var(--violet) 25%, transparent)",
              boxShadow: "var(--shadow-soft)",
              color: "var(--violet)",
            }}
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <span
            className="text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Daily
          </span>
        </button>
      </div>

      <Sheet
        open={streakOpen}
        onClose={() => setStreakOpen(false)}
        titleId={streakTitleId}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              id={streakTitleId}
              className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              Your streak
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              {formatDisplayDate()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStreakOpen(false)}
            className="rounded-full px-2.5 py-1 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loadingStats && !stats ? (
          <p
            className="mt-6 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Loading your stats…
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            <li>
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Day streak
              </p>
              <p
                className="mt-1 font-[family-name:var(--font-fraunces)] text-3xl"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                  color: "var(--foreground)",
                }}
              >
                {stats?.streakDays ?? 0}
                <span
                  className="ml-2 text-base font-sans font-medium"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {(stats?.streakDays ?? 0) === 1 ? "day" : "days"}
                </span>
              </p>
            </li>
            <li>
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Sessions today
              </p>
              <p
                className="mt-1 text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {stats?.sessionsToday ?? 0}
              </p>
            </li>
            <li>
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Most spoken planet
              </p>
              <p
                className="mt-1 text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {stats?.topPlanetLabel ?? "—"}
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                {(stats?.totalReflections ?? 0) === 0
                  ? "Record a session to start your map."
                  : `${stats?.totalReflections} reflection${(stats?.totalReflections ?? 0) === 1 ? "" : "s"} so far`}
              </p>
            </li>
          </ul>
        )}
      </Sheet>

      <Sheet
        open={dailyOpen}
        onClose={() => setDailyOpen(false)}
        titleId={dailyTitleId}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              id={dailyTitleId}
              className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              Daily prompt
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              {formatDisplayDate()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDailyOpen(false)}
            className="rounded-full px-2.5 py-1 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {topic && (
          <p
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `color-mix(in srgb, ${topic.color} 28%, var(--surface))`,
              color: "var(--foreground)",
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: topic.color }}
              aria-hidden="true"
            />
            {topic.label}
          </p>
        )}

        <p
          className="mt-4 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
            color: "var(--foreground)",
          }}
        >
          &ldquo;{question.text}&rdquo;
        </p>

        {dailyCompleted ? (
          <p
            className="mt-6 text-sm font-medium"
            style={{ color: "var(--violet)" }}
          >
            You already recorded today&rsquo;s daily. Come back tomorrow for a
            new question.
          </p>
        ) : (
          <TransitionLink
            href="/speak?mode=daily"
            variant="fade"
            className="mt-6 inline-flex rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            onClick={() => setDailyOpen(false)}
          >
            Start
          </TransitionLink>
        )}
      </Sheet>
    </>
  );
}
