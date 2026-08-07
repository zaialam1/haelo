"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  beginOrbitFromRecommendationAction,
  dismissOrbitRecommendationAction,
} from "@/lib/recommendations/actions";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import { orbitCtaLabel, getOrbitStatus } from "@/lib/orbits/ui";
import type { OrbitDefinition, OrbitListItem, UserOrbitProgressRow } from "@/lib/orbits/types";

export function RecommendationDetailClient({
  recommendationId,
  orbit,
  purpose,
  personalMessage,
  professionalUsername,
  progress,
  status,
}: {
  recommendationId: string;
  orbit: OrbitDefinition;
  purpose: string;
  personalMessage: string | null;
  professionalUsername: string | null;
  progress: UserOrbitProgressRow | null;
  status: string;
}) {
  const router = useRouter();
  const [confirmDismiss, setConfirmDismiss] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const listItem = {
    definition: orbit,
    progress,
    planetsInvolved: [],
    planetSequence: [],
  } as OrbitListItem;
  const orbitStatus = getOrbitStatus(listItem);
  const alreadyInProgress = orbitStatus === "in_progress";
  const alreadyCompleted = orbitStatus === "completed";
  const proLabel = professionalUsername
    ? formatUsernameDisplay(professionalUsername)
    : "Previously recommended";

  function onBegin() {
    startTransition(async () => {
      await beginOrbitFromRecommendationAction(recommendationId);
    });
  }

  function onDismiss() {
    startTransition(async () => {
      const result = await dismissOrbitRecommendationAction(recommendationId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/orbits");
      router.refresh();
    });
  }

  if (confirmDismiss) {
    return (
      <div className="space-y-5">
        <h2
          className="font-[family-name:var(--font-fraunces)] text-xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          Dismiss this recommendation?
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
          It will disappear from Recommended for you. You can still find this
          Orbit normally anytime.
        </p>
        {error ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={pending}
            onClick={onDismiss}
            className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-70"
          >
            {pending ? "Dismissing…" : "Dismiss"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmDismiss(false)}
            className="inline-flex justify-center rounded-full border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--hairline)", color: "var(--violet)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          Recommended Orbit
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          {orbit.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Recommended by {proLabel}
        </p>
      </div>

      <section
        className="rounded-2xl border px-4 py-4"
        style={{
          borderColor: "var(--surface-border)",
          background: "var(--surface)",
        }}
      >
        <h2 className="text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)]">
          Why they recommended it
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
          {purpose}
        </p>
        {personalMessage ? (
          <>
            <h2 className="mt-5 text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)]">
              A note from {proLabel}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
              &ldquo;{personalMessage}&rdquo;
            </p>
          </>
        ) : null}
      </section>

      <section>
        <h2
          className="font-[family-name:var(--font-fraunces)] text-lg"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          About this Orbit
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
          {orbit.shortDescription}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
          {orbit.openingBody}
        </p>
        <p className="mt-3 text-xs text-[var(--foreground-muted)]">
          {orbit.questionCount} reflections · About {orbit.estimatedMinutes}{" "}
          minutes
        </p>
      </section>

      {alreadyInProgress ? (
        <p className="text-sm text-[var(--foreground-muted)]">
          You&rsquo;re already working on this Orbit.
        </p>
      ) : null}
      {alreadyCompleted ? (
        <p className="text-sm text-[var(--foreground-muted)]">
          You&rsquo;ve completed this Orbit before.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {status !== "dismissed" ? (
          <button
            type="button"
            disabled={pending}
            onClick={onBegin}
            className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-70"
          >
            {pending
              ? "Opening…"
              : alreadyInProgress
                ? "Continue Orbit"
                : alreadyCompleted
                  ? "Revisit Orbit"
                  : orbitCtaLabel(orbitStatus)}
          </button>
        ) : null}
        <TransitionLink
          href="/orbits"
          variant="fade"
          className="inline-flex justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--violet)]"
          style={{ borderColor: "var(--hairline)" }}
        >
          Back to Orbits
        </TransitionLink>
        {status !== "dismissed" && status !== "completed" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmDismiss(true)}
            className="mt-2 text-center text-xs font-semibold text-[var(--foreground-muted)] underline-offset-2 hover:underline"
          >
            Dismiss recommendation
          </button>
        ) : null}
      </div>
    </div>
  );
}
