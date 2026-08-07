"use client";

import { useMemo, useState } from "react";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNavWithRole } from "@/components/home/HomeNavWithRole";
import { JourneyConstellation } from "@/components/journey/JourneyConstellation";
import { JourneyOrbitDetailPanel } from "@/components/journey/JourneyOrbitDetailPanel";
import { JourneyPlanetFilterBar } from "@/components/journey/JourneyPlanetFilter";
import { JourneySessionPanel } from "@/components/journey/JourneySessionPanel";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { buildJourneyViewModel } from "@/lib/journey/layout";
import { filterSessionsByPlanet } from "@/lib/journey/mapSession";
import type {
  JourneyNode,
  JourneyPlanetFilter,
  JourneyViewModel,
} from "@/lib/journey/types";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";

type JourneyExperienceProps = {
  model: JourneyViewModel;
  /** Initial planet filter from ?planet= */
  initialFilter?: JourneyPlanetFilter;
};

function formatBegan(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function JourneyExperience({
  model,
  initialFilter = "all",
}: JourneyExperienceProps) {
  const [filter, setFilter] = useState<JourneyPlanetFilter>(initialFilter);
  const [selected, setSelected] = useState<JourneyNode | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filteredModel = useMemo(() => {
    const sessions = filterSessionsByPlanet(model.sessions, filter);
    return buildJourneyViewModel(sessions, {
      isPreview: model.isPreview,
      filter,
    });
  }, [model.sessions, model.isPreview, filter]);

  const filterLabel =
    filter === "all"
      ? undefined
      : VOICE_PLANETS.find((p) => p.id === filter)?.label;

  const journeyEmpty = model.isEmpty;
  const filterEmpty = !journeyEmpty && filteredModel.isEmpty;
  const count = filteredModel.sessions.length;
  const orbitClusterOpen = Boolean(selected?.isOrbitCluster && panelOpen);
  const sessionPanelOpen = Boolean(
    panelOpen && selected && !selected.isOrbitCluster,
  );

  let contextLine: string | null = null;
  if (journeyEmpty) {
    contextLine =
      "Your first completed session will become the first star in your Journey.";
  } else if (filterEmpty && filter === "all") {
    contextLine =
      "Orbit reflections appear on their planets until you complete the full Orbit.";
  } else if (filter === "all" && count === 1) {
    contextLine = "Your constellation has begun.";
  } else if (filter === "all" && model.beganAt) {
    contextLine = `Your journey began ${formatBegan(model.beganAt)} · ${count} experiences`;
  } else if (filter !== "all") {
    contextLine =
      count === 0
        ? null
        : `${count} ${filterLabel ?? "planet"} reflection${count === 1 ? "" : "s"}`;
  } else {
    contextLine = `${count} experiences`;
  }

  function handleSelect(node: JourneyNode) {
    setSelected(node);
    setPanelOpen(true);
  }

  function handleClosePanel() {
    setPanelOpen(false);
  }

  return (
    <div
      className="journey-page relative flex h-dvh flex-col overflow-hidden"
      style={{ background: "var(--universe-map)" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <HomeNavWithRole />

      <main className="relative z-10 flex min-h-0 flex-1 flex-col pb-[4.5rem] pt-14 sm:pb-20 sm:pt-16">
        <div className="flex shrink-0 flex-col gap-3 px-5 pt-2 sm:px-8 sm:pt-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                className="font-[family-name:var(--font-fraunces)] text-2xl tracking-tight sm:text-3xl"
                style={{
                  color: "var(--foreground)",
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                }}
              >
                Your Journey
              </h1>
              <p
                className="mt-1 max-w-md text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Everything you&apos;ve explored with your voice.
              </p>
              {contextLine ? (
                <p
                  className="mt-1.5 text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {contextLine}
                </p>
              ) : null}
            </div>

            {!journeyEmpty ? (
              <JourneyPlanetFilterBar
                value={filter}
                onChange={(next) => {
                  setFilter(next);
                  setPanelOpen(false);
                  setSelected(null);
                }}
              />
            ) : null}
          </div>

          {model.isPreview ? (
            <p
              className="rounded-full px-3 py-1 text-[0.6875rem] font-medium tracking-wide"
              style={{
                width: "fit-content",
                background: "color-mix(in srgb, var(--gold) 28%, transparent)",
                color: "var(--violet)",
              }}
            >
              Development preview — not your real history. Disable via{" "}
              <code className="text-[0.65rem]">?preview=1</code> removal or{" "}
              <code className="text-[0.65rem]">JOURNEY_PREVIEW_ENABLED</code>.
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col sm:mt-4">
          <JourneyConstellation
            nodes={filteredModel.nodes}
            monthAnchors={filteredModel.monthAnchors}
            selectedId={panelOpen ? (selected?.sessionId ?? null) : null}
            onSelect={handleSelect}
            journeyEmpty={journeyEmpty}
            filterEmpty={filterEmpty}
            filterLabel={filterLabel}
            filter={filter}
          />
        </div>

        {journeyEmpty ? (
          <div className="shrink-0 px-5 pb-2 pt-4 text-center sm:px-8">
            <TransitionLink
              href="/home"
              variant="fade"
              className="journey-btn haelo-btn inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              Go to Universe
            </TransitionLink>
          </div>
        ) : filterEmpty ? (
          <div className="shrink-0 px-5 pb-2 pt-3 text-center sm:px-8">
            <p
              className="text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              {filter === "all"
                ? "Complete an Orbit or a planet session to place a star in your overall Journey."
                : `Practice on ${filterLabel ?? "this planet"} to add stars here — or switch back to All.`}
            </p>
          </div>
        ) : null}
      </main>

      <HomeBottomNav />

      <JourneySessionPanel
        session={sessionPanelOpen ? selected : null}
        open={sessionPanelOpen}
        onClose={handleClosePanel}
      />

      <JourneyOrbitDetailPanel
        cluster={orbitClusterOpen ? selected : null}
        open={orbitClusterOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
