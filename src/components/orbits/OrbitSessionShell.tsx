import type { ReactNode } from "react";
import type { Planet } from "@/lib/prompts";
import { getPlanetPageContent } from "@/lib/planets/content";

/** Orbit-flavored atmosphere around the shared session engine. */
export function OrbitSessionShell({
  planet,
  children,
}: {
  planet: Planet;
  children: ReactNode;
}) {
  const content = getPlanetPageContent(planet);

  return (
    <main
      className="orbits-page planet-page relative flex min-h-dvh w-full flex-col overflow-x-hidden"
      data-atmosphere={content.atmosphere}
      style={{ background: "var(--planet-page-bg, var(--background))" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 z-0 opacity-40"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div
        className="orbits-page-depth pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-10 sm:py-12">
        {children}
      </div>
    </main>
  );
}
