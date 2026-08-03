"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";

export type VoiceContext = {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  /** Brand fill — only palette colors */
  color: string;
};

const CONTEXTS: VoiceContext[] = [
  { id: "passion", label: "Passion", x: 50, y: 18, size: 22, color: "var(--gold)" },
  { id: "friends", label: "Friends", x: 20, y: 36, size: 18, color: "var(--rose)" },
  { id: "school", label: "School", x: 80, y: 40, size: 16, color: "var(--violet)" },
  { id: "family", label: "Family", x: 26, y: 72, size: 17, color: "var(--rose)" },
  { id: "challenge", label: "Challenge", x: 70, y: 78, size: 15, color: "var(--violet)" },
];

type ContextOrbitProps = {
  className?: string;
};

export function ContextOrbit({ className = "" }: ContextOrbitProps) {
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
        className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[2.25rem] border-2"
        style={{
          borderColor: "color-mix(in srgb, var(--violet) 35%, transparent)",
          background:
            "radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--gold) 55%, transparent), transparent 45%), radial-gradient(circle at 75% 30%, color-mix(in srgb, var(--rose) 50%, transparent), transparent 48%), radial-gradient(circle at 50% 80%, color-mix(in srgb, var(--violet) 40%, transparent), transparent 55%), var(--background)",
          boxShadow: "0 18px 50px color-mix(in srgb, var(--violet) 22%, transparent)",
        }}
        role="group"
        aria-labelledby={labelId}
      >
        {[90, 66, 42].map((size, i) => (
          <div
            key={size}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${size}%`, height: `${size}%` }}
            aria-hidden="true"
          >
            <div
              className="size-full rounded-full border-2 motion-safe:animate-[orbit-breathe_10s_ease-in-out_infinite]"
              style={{
                borderColor:
                  i === 0
                    ? "color-mix(in srgb, var(--violet) 45%, transparent)"
                    : i === 1
                      ? "color-mix(in srgb, var(--rose) 55%, transparent)"
                      : "color-mix(in srgb, var(--gold) 60%, transparent)",
                animationDelay: `${i * 0.6}s`,
              }}
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, var(--gold), var(--rose), var(--violet))",
            boxShadow: "0 0 24px color-mix(in srgb, var(--gold) 70%, transparent)",
          }}
          aria-hidden="true"
        />

        {CONTEXTS.map((context) => {
          const isActive = context.id === activeId;
          const diameter = isActive ? context.size + 8 : context.size;
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
                className="rounded-full transition-[width,height,box-shadow,transform] duration-500 ease-out"
                style={{
                  width: diameter,
                  height: diameter,
                  backgroundColor: context.color,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  boxShadow: isActive
                    ? "0 0 0 6px color-mix(in srgb, var(--gold) 50%, transparent), 0 8px 24px color-mix(in srgb, var(--violet) 28%, transparent)"
                    : "0 4px 16px color-mix(in srgb, var(--violet) 22%, transparent)",
                }}
                aria-hidden="true"
              />
              <span
                className="rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap sm:text-xs"
                style={{
                  color: "var(--foreground)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--gold) 55%, var(--background))"
                    : "color-mix(in srgb, var(--background) 85%, transparent)",
                }}
              >
                {context.label}
              </span>
            </button>
          );
        })}
      </div>

      <p
        className="mt-5 text-center text-sm font-medium"
        style={{ color: "var(--foreground)" }}
        aria-live="polite"
      >
        Right now:{" "}
        <span
          className="inline-flex items-center gap-2 font-semibold"
          style={{ color: "var(--violet)" }}
        >
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: active.color }}
            aria-hidden="true"
          />
          {active.label}
        </span>
        <span className="hidden sm:inline" style={{ color: "var(--foreground-muted)" }}>
          {" "}
          — tap another context to see it shift
        </span>
      </p>
    </div>
  );
}
