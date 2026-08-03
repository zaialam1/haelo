"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";

export type VoiceContext = {
  id: string;
  label: string;
  /** Position on a 0–100 canvas */
  x: number;
  y: number;
  size: number;
};

const CONTEXTS: VoiceContext[] = [
  { id: "passion", label: "Passion", x: 50, y: 18, size: 18 },
  { id: "friends", label: "Friends", x: 22, y: 38, size: 15 },
  { id: "school", label: "School", x: 78, y: 42, size: 13 },
  { id: "family", label: "Family", x: 28, y: 72, size: 14 },
  { id: "challenge", label: "Challenge", x: 68, y: 78, size: 12 },
];

type ContextOrbitProps = {
  className?: string;
  /** Compact variant for lower sections */
  compact?: boolean;
};

export function ContextOrbit({ className = "", compact = false }: ContextOrbitProps) {
  const labelId = useId();
  const [activeId, setActiveId] = useState(CONTEXTS[0].id);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const onTick = useEffectEvent(() => {
    if (paused) return;
    setActiveId((current) => {
      const index = CONTEXTS.findIndex((c) => c.id === current);
      return CONTEXTS[(index + 1) % CONTEXTS.length].id;
    });
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => onTick(), 3200);
    return () => window.clearInterval(id);
  }, [reducedMotion, paused]);

  const active = CONTEXTS.find((c) => c.id === activeId) ?? CONTEXTS[0];

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p id={labelId} className="sr-only">
        Interactive preview of how different parts of your voice relate. Select a
        context to highlight it.
      </p>

      <div
        className={`relative mx-auto aspect-square w-full overflow-hidden rounded-[2rem] border ${
          compact ? "max-w-md" : "max-w-lg"
        }`}
        style={{
          borderColor: "var(--hairline)",
          background:
            "radial-gradient(circle at 50% 45%, var(--violet-soft), transparent 62%)",
        }}
        role="group"
        aria-labelledby={labelId}
      >
        {[88, 64, 40].map((size) => (
          <div
            key={size}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${size}%`, height: `${size}%` }}
            aria-hidden="true"
          >
            <div
              className="size-full rounded-full border motion-safe:animate-[orbit-breathe_10s_ease-in-out_infinite]"
              style={{ borderColor: "var(--orbit-ring)" }}
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "var(--violet)", opacity: 0.35 }}
          aria-hidden="true"
        />

        {CONTEXTS.map((context) => {
          const isActive = context.id === activeId;
          const diameter = isActive ? context.size + 6 : context.size;
          return (
            <button
              key={context.id}
              type="button"
              aria-pressed={isActive}
              aria-label={`${context.label}${isActive ? ", selected" : ""}`}
              onClick={() => {
                setActiveId(context.id);
                setPaused(true);
              }}
              onFocus={() => setPaused(true)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
              style={{
                left: `${context.x}%`,
                top: `${context.y}%`,
              }}
            >
              <span
                className="rounded-full transition-[width,height,box-shadow] duration-500 ease-out"
                style={{
                  width: diameter,
                  height: diameter,
                  backgroundColor: "var(--violet)",
                  boxShadow: isActive
                    ? "0 0 0 5px color-mix(in srgb, var(--gold) 55%, transparent)"
                    : "none",
                }}
                aria-hidden="true"
              />
              <span
                className={`text-[0.6875rem] font-medium whitespace-nowrap sm:text-xs ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  color: isActive ? "var(--foreground)" : "var(--foreground-muted)",
                }}
              >
                {context.label}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-4 text-center text-sm"
        style={{ color: "var(--foreground-muted)" }}
        aria-live="polite"
      >
        Right now:{" "}
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          {active.label}
        </span>
        <span className="hidden sm:inline">
          {" "}
          — tap another context to see it shift
        </span>
      </p>
    </div>
  );
}
