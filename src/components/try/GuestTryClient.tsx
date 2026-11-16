"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HaloLogo } from "@/components/branding/HaloLogo";
import { RecordingSession } from "@/components/recording/RecordingSession";
import { ThemeIconToggle } from "@/components/theme/ThemeIconToggle";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  ensureGuestSession,
  pickGuestPrompt,
  rememberGuestPromptId,
  GUEST_MAX_SESSIONS,
} from "@/lib/guest";
import type { HaloPrompt } from "@/lib/prompts";
import { getPlanetPageContent } from "@/lib/planets/content";
import { guestSessionFlow } from "@/lib/sessions/sessionFlow";
import { createClient } from "@/lib/supabase/client";

type Phase = "boot" | "ready" | "quota" | "error";

type GuestTryClientProps = {
  /** Sessions already created for this anonymous user (from server). */
  sessionsUsed?: number;
  /** True when this anonymous user already completed at least one session. */
  isRepeatGuest?: boolean;
};

/**
 * Guest entry: ensure anonymous auth, show one curriculum prompt, reuse
 * RecordingSession. Skip does not create a session or burn AI quota.
 */
export function GuestTryClient({
  sessionsUsed = 0,
  isRepeatGuest = false,
}: GuestTryClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("boot");
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<HaloPrompt | null>(null);
  const [used, setUsed] = useState(sessionsUsed);
  const repeatTracked = useRef(false);
  const startedTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await ensureGuestSession();
        if (cancelled) return;

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.is_anonymous) {
          router.replace("/home");
          return;
        }

        const { count } = await supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        const sessionCount = count ?? 0;
        if (cancelled) return;
        setUsed(sessionCount);

        if (sessionCount >= GUEST_MAX_SESSIONS) {
          setPhase("quota");
          return;
        }

        if (
          (isRepeatGuest || sessionCount > 0) &&
          !repeatTracked.current
        ) {
          repeatTracked.current = true;
          void import("@/lib/analytics/track")
            .then((m) =>
              m.trackEvent("guest_session_repeat", {
                sessionsUsed: sessionCount,
              }),
            )
            .catch(() => {});
        }

        const next = pickGuestPrompt();
        rememberGuestPromptId(next.id);
        setPrompt(next);
        setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.message === "registered_user") {
          router.replace("/home");
          return;
        }
        setError(
          e instanceof Error
            ? e.message
            : "Guest practice isn’t working right now.",
        );
        setPhase("error");
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [router, isRepeatGuest]);

  function handleSkip() {
    if (!startedTracked.current) {
      startedTracked.current = true;
    }
    void import("@/lib/analytics/track")
      .then((m) =>
        m.trackEvent("guest_question_skipped", {
          planet: prompt?.planet ?? "express",
        }),
      )
      .catch(() => {});
    router.push("/try/done?skipped=1");
  }

  if (phase === "boot") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-16 sm:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <HaloLogo href="/" size="md" />
          <ThemeIconToggle />
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--foreground-muted)" }}
        >
          Finding a question…
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-14 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <HaloLogo href="/" size="md" />
          <ThemeIconToggle />
        </div>
        <h1
          className="mt-8 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Couldn’t start guest practice
        </h1>
        <p
          className="mt-4 text-[1.0625rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          {error}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <TransitionLink
            href="/signup"
            variant="fade"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--on-violet)]"
          >
            Create an account
          </TransitionLink>
          <TransitionLink
            href="/"
            variant="fade"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--violet)]"
          >
            Back to home
          </TransitionLink>
        </div>
      </div>
    );
  }

  if (phase === "quota") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-14 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <HaloLogo href="/" size="md" />
          <ThemeIconToggle />
        </div>
        <h1
          className="mt-8 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          That’s all {GUEST_MAX_SESSIONS} guest sessions
        </h1>
        <p
          className="mt-4 text-[1.0625rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Create an account to keep going and save what you already practiced.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <TransitionLink
            href="/signup"
            variant="fade"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)]"
          >
            Create account
          </TransitionLink>
          <TransitionLink
            href="/"
            variant="fade"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--violet)]"
          >
            Leave
          </TransitionLink>
        </div>
      </div>
    );
  }

  if (!prompt) return null;

  const content = getPlanetPageContent(prompt.planet);
  const remaining = Math.max(0, GUEST_MAX_SESSIONS - used);

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-10 sm:py-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HaloLogo href="/" size="sm" />
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Guest · {content.label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p
            className="text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            {remaining} of {GUEST_MAX_SESSIONS} left
          </p>
          <TransitionLink
            href="/signup"
            variant="fade"
            className="text-sm font-medium text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Create account
          </TransitionLink>
        </div>
      </div>

      <RecordingSession
        planet={prompt.planet}
        prompt={{ id: prompt.id, text: prompt.prompt }}
        flow={guestSessionFlow(prompt.planet)}
        guestMode
        firstSession
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--violet)_18%,transparent)] pt-5">
        <button
          type="button"
          onClick={handleSkip}
          className="halo-btn text-sm font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Skip this question
        </button>
        <TransitionLink
          href="/"
          variant="fade"
          className="text-sm font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          Leave
        </TransitionLink>
      </div>
    </div>
  );
}
