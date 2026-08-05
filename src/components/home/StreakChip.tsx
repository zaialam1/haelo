"use client";

import { useEffect, useState } from "react";
import { fetchStreakStats } from "@/lib/home/streakStats";

export function StreakChip() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStreakStats()
      .then((stats) => {
        if (!cancelled) setDays(stats.streakDays);
      })
      .catch(() => {
        if (!cancelled) setDays(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (days === null) {
    return (
      <div
        className="h-8 w-20 rounded-full opacity-40"
        style={{
          background: "color-mix(in srgb, var(--violet) 12%, transparent)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <p
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tabular-nums"
      style={{
        color: "var(--foreground-muted)",
        background: "color-mix(in srgb, var(--violet) 10%, transparent)",
      }}
      aria-label={`${days} day streak`}
    >
      <span
        className="inline-block size-1.5 rounded-full"
        style={{ background: "var(--gold)" }}
        aria-hidden="true"
      />
      {days} day{days === 1 ? "" : "s"}
    </p>
  );
}
