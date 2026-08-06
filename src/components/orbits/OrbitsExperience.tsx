"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { OrbitConstellation } from "@/components/orbits/OrbitConstellation";
import { OrbitInProgress } from "@/components/orbits/OrbitInProgress";
import {
  OrbitRegionCluster,
  RegionMapNetwork,
} from "@/components/orbits/OrbitRegionCluster";
import { OrbitSkyDecor } from "@/components/orbits/OrbitSkyDecor";
import {
  getOrbitStatus,
  matchesOrbitSearch,
} from "@/lib/orbits/ui";
import type {
  OrbitListItem,
  OrbitRegionDefinition,
  OrbitRegionKey,
} from "@/lib/orbits/types";

type OrbitsExperienceProps = {
  regions: readonly OrbitRegionDefinition[];
  items: OrbitListItem[];
  initialRegion?: OrbitRegionKey | null;
  loadError?: string | null;
};

export function OrbitsExperience({
  regions,
  items,
  initialRegion = null,
  loadError = null,
}: OrbitsExperienceProps) {
  const [region, setRegion] = useState<OrbitRegionKey | null>(initialRegion);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

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
      .filter((i) => matchesOrbitSearch(i, deferredQuery, regionTitle))
      .sort(
        (a, b) => a.definition.sortOrder - b.definition.sortOrder,
      );
  }, [items, region, deferredQuery, regionTitle]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-start justify-between gap-3 px-4 sm:px-8 lg:px-12">
        <div className="min-w-0 max-w-lg">
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

        <div className="relative shrink-0">
          {searchOpen ? (
            <label className="block">
              <span className="sr-only">Search Orbits</span>
              <input
                type="search"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => {
                  if (!query.trim()) setSearchOpen(false);
                }}
                placeholder="What are you navigating?"
                className="w-[11.5rem] rounded-full px-3 py-1.5 text-[0.75rem] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:w-[14rem]"
                style={{
                  background:
                    "color-mix(in srgb, var(--foreground) 4%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--violet) 16%, transparent)",
                  color: "var(--foreground)",
                }}
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full px-3 py-1.5 text-[0.6875rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                color: "var(--foreground-muted)",
                border:
                  "1px solid color-mix(in srgb, var(--violet) 14%, transparent)",
              }}
              aria-label="Search Orbits"
            >
              Search
            </button>
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
              query={deferredQuery}
            />
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-[3]">
          {regions.map((r) => (
            <OrbitRegionCluster
              key={r.key}
              region={r}
              active={region === r.key}
              dimmed={region != null && region !== r.key}
              onSelect={() =>
                setRegion((current) => (current === r.key ? null : r.key))
              }
            />
          ))}
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
      </div>
    </div>
  );
}
