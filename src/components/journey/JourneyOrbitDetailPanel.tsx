"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { JourneySessionDetail } from "@/components/journey/JourneySessionDetail";
import { PlanetTags } from "@/components/orbits/PlanetTags";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { retryOrbitSynthesisAction } from "@/lib/orbits/actions";
import { planetAccent } from "@/lib/journey/mapSession";
import type { JourneyNode, JourneySession } from "@/lib/journey/types";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import type { Planet } from "@/lib/prompts";

type JourneyOrbitDetailPanelProps = {
  cluster: JourneySession | JourneyNode | null;
  open: boolean;
  onClose: () => void;
};

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AnalysisSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h3
        className="text-[0.8125rem] font-semibold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {body}
      </p>
    </section>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-8">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/**
 * Mini constellation for the six Orbit reflections.
 * Desktop: gentle horizontal path. Mobile: vertical / staggered path.
 */
function OrbitMiniConstellation({
  responses,
  selectedId,
  onSelect,
}: {
  responses: JourneySession[];
  selectedId: string | null;
  onSelect: (session: JourneySession) => void;
}) {
  if (responses.length === 0) {
    return (
      <p
        className="text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Individual reflections from this Orbit could not be loaded.
      </p>
    );
  }

  return (
    <ol className="journey-orbit-mini-path relative flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-2">
      {responses.map((response, index) => {
        const accent = planetAccent(response.planet);
        const selected = selectedId === response.sessionId;
        const seq = response.orbitSequenceNumber ?? index + 1;
        const label = `${response.planetLabel}, reflection ${seq} of ${responses.length}: ${response.prompt.slice(0, 80)}`;

        return (
          <li
            key={response.sessionId}
            className="relative flex min-w-0 flex-1 flex-col sm:max-w-[9.5rem]"
          >
            {index < responses.length - 1 ? (
              <span
                className="pointer-events-none absolute left-5 top-10 hidden h-[calc(100%-1.5rem)] w-px sm:left-auto sm:right-[-0.35rem] sm:top-5 sm:h-px sm:w-[calc(100%-2rem)]"
                style={{
                  background:
                    "color-mix(in srgb, var(--violet) 35%, transparent)",
                }}
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(response)}
              aria-label={label}
              aria-pressed={selected}
              className="journey-orbit-mini-node group flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:flex-col sm:items-start sm:gap-2 sm:px-2.5 sm:py-3"
              style={{
                background: selected
                  ? "color-mix(in srgb, var(--violet) 12%, transparent)"
                  : "color-mix(in srgb, var(--violet) 5%, transparent)",
                boxShadow: selected
                  ? `0 0 0 1px color-mix(in srgb, ${accent} 45%, transparent)`
                  : undefined,
              }}
            >
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center sm:size-9">
                <span
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${accent}`,
                  }}
                  aria-hidden="true"
                />
                <span
                  className="size-3 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125"
                  style={{
                    background: accent,
                    boxShadow: `0 0 12px color-mix(in srgb, ${accent} 55%, transparent)`,
                  }}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: accent }}
                >
                  {seq}. {response.planetLabel}
                </span>
                <span
                  className="mt-0.5 block text-[0.75rem] leading-snug line-clamp-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {response.prompt}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SummativeBlock({
  orbitKey,
  status,
  analysis,
}: {
  orbitKey: string;
  status: "pending" | "ready" | "failed" | "missing";
  analysis: OrbitSummativeAnalysisContent | null;
}) {
  const [pending, startTransition] = useTransition();
  const [override, setOverride] = useState<{
    status: "pending" | "ready" | "failed" | "missing";
    analysis: OrbitSummativeAnalysisContent | null;
    failure: string | null;
  } | null>(null);

  const localStatus = override?.status ?? status;
  const localAnalysis = override ? override.analysis : analysis;
  const localFailure = override?.failure ?? null;

  function handleRetry() {
    startTransition(async () => {
      setOverride({ status: "pending", analysis: null, failure: null });
      const result = await retryOrbitSynthesisAction(orbitKey);
      if (result.ok) {
        setOverride({
          status: "ready",
          analysis: result.content,
          failure: null,
        });
      } else {
        setOverride({
          status: "failed",
          analysis: null,
          failure: result.message,
        });
      }
    });
  }

  const showPending = localStatus === "pending" || pending;

  return (
    <PanelSection title="What came into focus">
      {showPending ? (
        <p
          className="text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
          aria-live="polite"
        >
          Haelo is still gathering your Orbit reflection…
        </p>
      ) : null}

      {(localStatus === "failed" || localStatus === "missing") &&
      !showPending ? (
        <div>
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--rose-deep, #D478A0)" }}
            role="alert"
          >
            {localFailure ||
              "The final Orbit reflection isn’t available yet. You can try again."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="journey-btn haelo-btn mt-4 inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "var(--violet)",
              color: "var(--on-violet)",
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {localStatus === "ready" && localAnalysis && !showPending ? (
        <div className="space-y-7">
          <AnalysisSection
            title="What Became Clearer"
            body={localAnalysis.whatBecameClearer}
          />
          <AnalysisSection
            title="What Kept Coming Up"
            body={localAnalysis.whatKeptComingUp}
          />
          <AnalysisSection
            title="How Your Voice Moved"
            body={localAnalysis.howYourVoiceMoved}
          />
          <AnalysisSection
            title="Carry This With You"
            body={localAnalysis.carryThisWithYou}
          />
        </div>
      ) : null}
    </PanelSection>
  );
}

export function JourneyOrbitDetailPanel({
  cluster,
  open,
  onClose,
}: JourneyOrbitDetailPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [selectedResponse, setSelectedResponse] =
    useState<JourneySession | null>(null);

  // Reset nested selection when the panel closes or cluster changes.
  const resetKey = `${open ? "open" : "closed"}:${cluster?.sessionId ?? "none"}`;
  const [seenResetKey, setSeenResetKey] = useState(resetKey);
  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey);
    if (selectedResponse !== null) {
      setSelectedResponse(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedResponse) {
          setSelectedResponse(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, selectedResponse]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open, cluster?.sessionId, selectedResponse?.sessionId]);

  const title = cluster?.orbitTitle ?? cluster?.prompt ?? "Orbit";
  const started = formatDate(cluster?.orbitStartedAt);
  const completed = formatDate(
    cluster?.orbitCompletedAt ?? cluster?.recordedAt,
  );
  const responses = cluster?.orbitResponses ?? [];
  const planets = (cluster?.orbitPlanets ?? []) as Planet[];

  return (
    <>
      <div
        className="journey-panel-backdrop fixed inset-0 z-40 bg-black/25"
        data-open={open}
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="journey-orbit-panel fixed z-50 flex flex-col overflow-y-auto outline-none"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
        }}
        data-open={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
      >
        {cluster ? (
          <div
            key={cluster.sessionId}
            className="flex flex-1 flex-col px-6 py-6 sm:px-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: "var(--gold)" }}
                >
                  Orbit
                  {cluster.orbitRegionTitle ? (
                    <>
                      <span className="mx-2 opacity-40" aria-hidden="true">
                        ·
                      </span>
                      <span style={{ color: "var(--foreground-muted)" }}>
                        {cluster.orbitRegionTitle}
                      </span>
                    </>
                  ) : null}
                </p>
                <h2
                  id={titleId}
                  className="mt-2 font-[family-name:var(--font-fraunces)] text-2xl tracking-tight sm:text-3xl"
                  style={{
                    color: "var(--foreground)",
                    fontVariationSettings:
                      '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                  }}
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="journey-btn journey-btn-ghost rounded-full px-2.5 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{ color: "var(--foreground-muted)" }}
                aria-label="Close Orbit details"
              >
                Close
              </button>
            </div>

            {selectedResponse ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedResponse(null)}
                  className="journey-btn journey-btn-ghost mb-5 inline-flex min-h-10 items-center rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--violet) 10%, transparent)",
                    color: "var(--foreground)",
                  }}
                >
                  ← Back to {title}
                </button>
                <JourneySessionDetail
                  session={selectedResponse}
                  hideOrbitSource
                  compact
                />
              </div>
            ) : (
              <>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {[
                    started ? `Started ${started}` : null,
                    completed ? `Completed ${completed}` : "Completed",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                {cluster.orbitShortDescription || cluster.orbitSituation ? (
                  <p
                    className="mt-4 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {cluster.orbitSituation ?? cluster.orbitShortDescription}
                  </p>
                ) : null}

                {planets.length > 0 ? (
                  <div className="mt-5">
                    <p
                      className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Planets involved
                    </p>
                    <PlanetTags planets={planets} className="mt-2" size="sm" />
                  </div>
                ) : null}

                <PanelSection title="Six reflections">
                  <OrbitMiniConstellation
                    responses={responses}
                    selectedId={null}
                    onSelect={setSelectedResponse}
                  />
                </PanelSection>

                {cluster.orbitKey ? (
                  <SummativeBlock
                    key={cluster.orbitKey}
                    orbitKey={cluster.orbitKey}
                    status={cluster.summativeStatus ?? "missing"}
                    analysis={cluster.summativeAnalysis ?? null}
                  />
                ) : null}

                {cluster.reviewHref ? (
                  <div className="mt-10">
                    <TransitionLink
                      href={cluster.reviewHref}
                      variant="fade"
                      className="journey-btn haelo-btn inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                      style={{
                        background:
                          "color-mix(in srgb, var(--violet) 12%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      Open Orbit complete page
                    </TransitionLink>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </aside>
    </>
  );
}
