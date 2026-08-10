"use client";

import { useMemo, useState, useTransition } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { OrbitConstellation } from "@/components/orbits/OrbitConstellation";
import { OrbitInProgress } from "@/components/orbits/OrbitInProgress";
import {
  OrbitRegionCluster,
  RegionMapNetwork,
} from "@/components/orbits/OrbitRegionCluster";
import { OrbitSkyDecor } from "@/components/orbits/OrbitSkyDecor";
import { searchOrbitsAction } from "@/lib/orbits/actions";
import { getOrbitStatus } from "@/lib/orbits/ui";
import type {
  OrbitListItem,
  OrbitRegionDefinition,
  OrbitRegionKey,
} from "@/lib/orbits/types";
import type { OrbitSearchMatch } from "@/lib/orbits/search";
import type { OrbitRecommendation } from "@/lib/recommendations/types";
import { RecommendedForYou } from "@/components/recommendations/RecommendedForYou";

type OrbitsExperienceProps = {
  regions: readonly OrbitRegionDefinition[];
  items: OrbitListItem[];
  initialRegion?: OrbitRegionKey | null;
  loadError?: string | null;
  recommendations?: OrbitRecommendation[];
};

const SEARCH_PLACEHOLDERS = [
  "I feel left out",
  "I need to talk to my teacher",
  "I don't know what I want",
  "I have an audition",
  "My friends keep pressuring me",
];

export function OrbitsExperience({
  regions,
  items,
  initialRegion = null,
  loadError = null,
  recommendations = [],
}: OrbitsExperienceProps) {
  const [region, setRegion] = useState<OrbitRegionKey | null>(initialRegion);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<OrbitSearchMatch[] | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const highlightKeys = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    return new Set(matches.map((m) => m.orbitKey));
  }, [matches]);

  const matchRegions = useMemo(() => {
    if (!highlightKeys) return null;
    const keys = new Set<OrbitRegionKey>();
    for (const item of items) {
      if (highlightKeys.has(item.definition.orbitKey)) {
        keys.add(item.definition.regionKey);
      }
    }
    return keys;
  }, [highlightKeys, items]);

  const inProgressItems = useMemo(
    () =>
      items
        .filter((i) => getOrbitStatus(i) === "in_progress")
        .sort((a, b) => {
          const aTime = a.progress?.last_activity_at ?? "";
          const bTime = b.progress?.last_activity_at ?? "";
          return bTime.localeCompare(aTime);
        }),
    [items],
  );

  const regionMeta = region
    ? regions.find((r) => r.key === region)
    : undefined;
  const regionTitle = regionMeta?.title ?? "";

  const regionItems = useMemo(() => {
    if (!region) return [];
    return items
      .filter((i) => i.definition.regionKey === region)
      .sort(
        (a, b) => a.definition.sortOrder - b.definition.sortOrder,
      );
  }, [items, region]);

  function clearSearch() {
    setMatches(null);
    setNoMatch(false);
    setUsedFallback(false);
    setSearchError(null);
    setQuery("");
  }

  function runSearch(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) {
      clearSearch();
      return;
    }
    setSearchError(null);
    startTransition(async () => {
      try {
        const result = await searchOrbitsAction(trimmed);
        setUsedFallback(result.usedFallback);
        if (result.matches.length === 0) {
          setMatches([]);
          setNoMatch(true);
          return;
        }
        setNoMatch(false);
        setMatches(result.matches);
        // Auto-focus the first match's region so illumination is visible
        const firstRegion = result.matches[0]?.regionKey;
        if (firstRegion) setRegion(firstRegion);
      } catch {
        setSearchError(
          "Search couldn’t finish. You can still explore all Orbits.",
        );
        setMatches(null);
        setNoMatch(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="px-4 sm:px-8 lg:px-12">
        <form
          className="max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
        >
          <label
            htmlFor="orbit-situation-search"
            className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight sm:text-xl"
            style={{ color: "var(--foreground)" }}
          >
            What are you navigating?
          </label>
          <p
            className="mt-1 text-[0.75rem] leading-relaxed sm:text-[0.8125rem]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Try something like “{SEARCH_PLACEHOLDERS[0]}” or “
            {SEARCH_PLACEHOLDERS[2]}”.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              id="orbit-situation-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I need to tell my friend I'm upset"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-[0.875rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)]"
              style={{
                background:
                  "color-mix(in srgb, var(--background) 88%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--violet) 28%, transparent)",
                color: "var(--foreground)",
              }}
              aria-describedby="orbit-search-status"
            />
            <button
              type="submit"
              className="haelo-btn shrink-0 rounded-2xl px-4 py-2.5 text-[0.8125rem] font-semibold"
              style={{
                background: "var(--violet)",
                color: "var(--on-violet)",
              }}
              disabled={isPending || !query.trim()}
            >
              {isPending ? "Looking…" : "Find"}
            </button>
            {matches !== null || noMatch ? (
              <button
                type="button"
                className="haelo-btn shrink-0 rounded-2xl px-3 py-2.5 text-[0.75rem] font-semibold"
                style={{
                  background: "transparent",
                  color: "var(--foreground-muted)",
                  border:
                    "1px solid color-mix(in srgb, var(--foreground) 16%, transparent)",
                }}
                onClick={clearSearch}
              >
                Clear
              </button>
            ) : null}
          </div>
          <p
            id="orbit-search-status"
            className="mt-2 text-[0.75rem]"
            style={{ color: "var(--foreground-muted)" }}
            aria-live="polite"
          >
            {searchError
              ? searchError
              : usedFallback && matches && matches.length > 0
                ? "Showing close title matches — AI search was unavailable."
                : null}
          </p>
        </form>

        {matches && matches.length > 0 ? (
          <div className="mt-4 max-w-xl" role="region" aria-label="Orbit matches">
            <h3
              className="text-[0.75rem] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--foreground-muted)" }}
            >
              Nearby destinations
            </h3>
            <ul className="mt-2 flex flex-col gap-2.5">
              {matches.map((match) => (
                <li key={match.orbitKey}>
                  <TransitionLink
                    href={`/orbits/${match.orbitKey}`}
                    variant="fade"
                    className="block rounded-2xl px-3.5 py-3 transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                    style={{
                      background:
                        "color-mix(in srgb, var(--gold) 10%, var(--background))",
                      border:
                        "1px solid color-mix(in srgb, var(--gold) 35%, transparent)",
                    }}
                  >
                    <span
                      className="block font-[family-name:var(--font-display)] text-[0.95rem] font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {match.title}
                    </span>
                    <span
                      className="mt-0.5 block text-[0.8125rem] leading-snug"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {match.shortDescription}
                    </span>
                    <span
                      className="mt-1.5 block text-[0.75rem] leading-snug"
                      style={{ color: "var(--foreground)" }}
                    >
                      <span className="font-semibold">Why this might fit: </span>
                      {match.why}
                    </span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {noMatch ? (
          <p
            className="mt-4 max-w-xl text-[0.875rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
            role="status"
          >
            I&apos;m not finding a close match yet. You can still explore all
            Orbits.
          </p>
        ) : null}

        <div className="mt-5 min-w-0 max-w-lg">
          {region && regionMeta ? (
            <>
              <h2
                className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight sm:text-2xl"
                style={{ color: "var(--foreground)" }}
              >
                {regionMeta.title}
              </h2>
              <p
                className="mt-1 text-[0.8125rem] leading-relaxed sm:text-[0.875rem]"
                style={{ color: "var(--foreground-muted)" }}
              >
                {regionMeta.description}
              </p>
              <p
                className="mt-1.5 text-[0.75rem]"
                style={{ color: "var(--foreground-muted)" }}
                aria-live="polite"
              >
                Tap a star to open an Orbit — or choose another corner of the
                sky.
              </p>
            </>
          ) : (
            <p
              className="text-[0.8125rem] leading-relaxed sm:text-[0.875rem]"
              style={{ color: "var(--foreground-muted)" }}
              aria-live="polite"
            >
              Choose a region of the sky to begin.
            </p>
          )}
        </div>
      </div>

      {loadError ? (
        <div
          className="mx-4 rounded-2xl px-4 py-3 text-[0.8125rem] leading-relaxed sm:mx-8 lg:mx-12"
          style={{
            background: "color-mix(in srgb, var(--rose) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--rose) 28%, transparent)",
            color: "var(--foreground-muted)",
          }}
          role="alert"
        >
          <p>Progress couldn&apos;t load — you can still explore every Orbit.</p>
          <button
            type="button"
            className="mt-2 text-[0.75rem] font-semibold"
            style={{ color: "var(--violet)" }}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : null}

      {/*
        Layer order (bottom → top):
        0 decor · 1 network · 2 constellation (stars clickable) · 3 region hubs
        Region wrapper must be pointer-events-none or it blocks star clicks.
      */}
      <div
        className="orbits-star-map relative w-full"
        role="tablist"
        aria-label="Orbit regions"
      >
        <div
          className="orbits-map-drift-layer pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <OrbitSkyDecor dimmed={region != null} />
          <div className="orbits-map-haze absolute inset-0" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1]">
          <RegionMapNetwork regions={regions} activeRegion={region} />
        </div>

        {region ? (
          <div className="absolute inset-0 z-[2]">
            <OrbitConstellation
              regionKey={region}
              items={regionItems}
              highlightKeys={highlightKeys}
            />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-[3]">
          {regions.map((r) => {
            const dimmedByRegion = region != null && region !== r.key;
            const dimmedBySearch =
              matchRegions != null && !matchRegions.has(r.key);
            return (
              <OrbitRegionCluster
                key={r.key}
                region={r}
                active={region === r.key}
                dimmed={dimmedByRegion || dimmedBySearch}
                onSelect={() =>
                  setRegion((current) => (current === r.key ? null : r.key))
                }
              />
            );
          })}
        </div>
      </div>

      {region && regionItems.length > 0 ? (
        <div className="sr-only">
          <h2>{regionTitle} Orbits</h2>
          <ul>
            {regionItems.map((item) => (
              <li key={item.definition.orbitKey}>
                <a href={`/orbits/${item.definition.orbitKey}`}>
                  {item.definition.title}. {item.definition.shortDescription}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="px-4 sm:px-8 lg:px-12">
        <OrbitInProgress items={inProgressItems} />
        <RecommendedForYou recommendations={recommendations} />
      </div>
    </div>
  );
}
