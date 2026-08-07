"use client";

import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNav } from "@/components/home/HomeNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";
import {
  retryMyVoiceAction,
  trackMyVoiceJourneyClickAction,
} from "@/lib/myVoice/actions";
import type { MyVoiceViewModel } from "@/lib/myVoice/types";
import {
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";

function PlanetHalo() {
  const byId = Object.fromEntries(VOICE_PLANETS.map((p) => [p.id, p]));
  const layout: Array<{
    id: "connect" | "stand" | "explore" | "express";
    className: string;
  }> = [
    { id: "connect", className: "top-0 left-1/2 -translate-x-1/2" },
    { id: "stand", className: "top-1/2 left-0 -translate-y-1/2" },
    { id: "express", className: "top-1/2 right-0 -translate-y-1/2" },
    { id: "explore", className: "bottom-0 left-1/2 -translate-x-1/2" },
  ];

  return (
    <div
      className="my-voice-planet-halo relative mx-auto mb-8 size-40 sm:mb-10 sm:size-48"
      aria-hidden="true"
    >
      {layout.map(({ id, className }) => {
        const planet = byId[id]!;
        return (
          <span
            key={id}
            className={`absolute flex flex-col items-center ${className}`}
          >
            <span
              className="size-3 rounded-full sm:size-3.5"
              style={{
                background: planet.color,
                boxShadow: `0 0 12px color-mix(in srgb, ${planet.color} 55%, transparent)`,
              }}
            />
            <span
              className="mt-1.5 text-[0.625rem] font-medium tracking-[0.08em] uppercase sm:text-[0.6875rem]"
              style={{ color: "var(--foreground-muted)" }}
            >
              {planet.label}
            </span>
          </span>
        );
      })}
      <span
        className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-16"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, color-mix(in srgb, #fff8f0 75%, var(--gold)), color-mix(in srgb, var(--gold) 65%, var(--rose)), color-mix(in srgb, var(--violet) 50%, var(--gold)))",
          boxShadow:
            "0 0 28px color-mix(in srgb, var(--gold) 45%, transparent)",
        }}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-9">
      <h2
        className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight text-[var(--foreground)] sm:text-2xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        {title}
      </h2>
      <p
        className="mt-3 text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--foreground)" }}
      >
        {children}
      </p>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="my-voice-gather relative mb-8 size-32" aria-hidden="true">
        {VOICE_PLANETS.map((planet, i) => (
          <span
            key={planet.id}
            className="my-voice-gather-dot absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-[my-voice-gather_2.4s_ease-in-out_infinite]"
            style={{
              background: planet.color,
              animationDelay: `${i * 0.18}s`,
              ["--gather-angle" as string]: `${i * 90}deg`,
            }}
          />
        ))}
        <span
          className="absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--gold) 70%, #fff8f0), color-mix(in srgb, var(--violet) 45%, var(--rose)))",
          }}
        />
      </div>
      <p
        className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-[var(--foreground)]"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        Your voice has been taking shape…
      </p>
      <p
        className="mt-3 max-w-md text-base leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Haelo is gathering what it has noticed across your Universe.
      </p>
    </div>
  );
}

function PlanetShortcuts() {
  return (
    <div className="mt-10">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Keep exploring your Universe
      </p>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {VOICE_PLANETS.map((planet) => (
          <li key={planet.id}>
            <TransitionLink
              href={planet.href}
              variant="warp"
              accent={planet.color}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background: `color-mix(in srgb, ${planet.color} 22%, var(--surface))`,
                color: "var(--foreground)",
                border: `1px solid color-mix(in srgb, ${planet.color} 35%, transparent)`,
              }}
            >
              <span
                className="size-2.5 rounded-full"
                style={{
                  background: planet.color,
                  boxShadow: `0 0 8px color-mix(in srgb, ${planet.color} 50%, transparent)`,
                }}
                aria-hidden="true"
              />
              {planet.label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div>
      <PlanetHalo />
      <p
        className="text-center font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        Your voice is waiting to be heard
      </p>
      <p
        className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--foreground-muted)" }}
      >
        Record a reflection on any planet — Connect, Stand, Explore, or Express
        — and Haelo will begin noticing how you communicate.
      </p>
      <PlanetShortcuts />
    </div>
  );
}

function BeginningState({ sessionCount }: { sessionCount: number }) {
  return (
    <div>
      <PlanetHalo />
      <p
        className="text-center font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        Your voice is just beginning to take shape.
      </p>
      <p
        className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--foreground)" }}
      >
        As you explore Connect, Stand, Explore, and Express, Haelo will start
        noticing patterns in how you communicate across different moments.
      </p>
      <p
        className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed sm:text-base"
        style={{ color: "var(--foreground-muted)" }}
      >
        Keep exploring your Universe
        {sessionCount > 0
          ? ` — ${sessionCount} reflection${sessionCount === 1 ? "" : "s"} so far.`
          : "."}
      </p>
      <PlanetShortcuts />
    </div>
  );
}

function ReadyContent({
  view,
}: {
  view: Extract<MyVoiceViewModel, { phase: "ready" }>;
}) {
  const { content } = view;
  return (
    <div>
      <PlanetHalo />
      <p
        className="text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--foreground)" }}
      >
        {content.openingSynthesis}
      </p>
      <Section title="Taking Shape">{content.takingShape}</Section>
      <Section title="Still Exploring">{content.stillExploring}</Section>
      <Section title="Across Your Voice">{content.acrossYourVoice}</Section>
      {content.carryForward ? (
        <section className="mt-9">
          <h2
            className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Carry forward
          </h2>
          <p
            className="mt-3 text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--foreground)" }}
          >
            {content.carryForward}
          </p>
        </section>
      ) : null}
      <p
        className="mt-10 text-center text-sm tracking-wide"
        style={{ color: "var(--foreground-muted)" }}
      >
        {view.refreshing ? "Updating gently…" : view.updatedLabel}
      </p>
      <div className="mt-6 flex justify-center">
        <TransitionLink
          href="/journey"
          variant="fade"
          onClick={() => {
            void trackMyVoiceJourneyClickAction();
          }}
          className="text-base font-medium underline-offset-4 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
          style={{ color: "var(--violet)" }}
        >
          Explore your Journey →
        </TransitionLink>
      </div>
    </div>
  );
}

function ErrorState({
  view,
  onRetry,
  pending,
}: {
  view: Extract<MyVoiceViewModel, { phase: "error" }>;
  onRetry: () => void;
  pending: boolean;
}) {
  if (view.content) {
    return (
      <ReadyContent
        view={{
          phase: "ready",
          sessionCount: view.sessionCount,
          content: view.content,
          generatedAt: view.generatedAt ?? "",
          sessionCountAtGeneration: view.sessionCount,
          updatedLabel: view.updatedLabel ?? "Updated recently",
        }}
      />
    );
  }

  return (
    <div className="py-8 text-center">
      <PlanetHalo />
      <p
        className="mx-auto max-w-lg text-base leading-relaxed sm:text-lg"
        style={{ color: "var(--foreground)" }}
      >
        {view.message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={pending}
        className="mt-6 rounded-full px-5 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] disabled:opacity-60"
        style={{
          background: "var(--violet-soft)",
          color: "var(--violet)",
        }}
      >
        {pending ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}

type MyVoiceExperienceProps = {
  initialView: MyVoiceViewModel;
};

export function MyVoiceExperience({ initialView }: MyVoiceExperienceProps) {
  const [view, setView] = useState<MyVoiceViewModel>(initialView);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (initialView.phase !== "ready" || !initialView.refreshing) return;
    let cancelled = false;
    startTransition(async () => {
      const refreshed = await retryMyVoiceAction();
      if (cancelled) return;
      if (refreshed.ok && refreshed.view.phase === "ready") {
        setView(refreshed.view);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialView]);

  const handleRetry = () => {
    setView({ phase: "generating", sessionCount: view.sessionCount });
    startTransition(async () => {
      const result = await retryMyVoiceAction();
      if (!result.ok) {
        setView({
          phase: "error",
          sessionCount: view.sessionCount,
          message: result.message,
        });
        return;
      }
      setView(result.view);
    });
  };

  return (
    <div
      className="relative min-h-dvh"
      style={{ background: "var(--universe-map)" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <HomeNav pinned />

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col px-5 pb-28 pt-24 sm:max-w-3xl sm:px-8 sm:pt-28">
        <TransitionLink
          href="/home"
          variant="fade"
          className="mb-10 inline-flex w-fit items-center gap-1.5 text-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Universe
        </TransitionLink>

        <h1
          className="text-center font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl"
          style={{
            color: "var(--foreground)",
            fontVariationSettings: '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          My Voice
        </h1>

        <div className="mt-8 sm:mt-10">
          {view.phase === "generating" ? (
            <LoadingState />
          ) : view.phase === "empty" ? (
            <EmptyState />
          ) : view.phase === "beginning" ? (
            <BeginningState sessionCount={view.sessionCount} />
          ) : view.phase === "ready" ? (
            <ReadyContent view={view} />
          ) : (
            <ErrorState
              view={view}
              onRetry={handleRetry}
              pending={pending}
            />
          )}
        </div>
      </main>

      <HomeBottomNav />
    </div>
  );
}
