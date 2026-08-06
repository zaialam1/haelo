import type { ReactNode } from "react";
import type { Planet } from "@/lib/prompts";
import { getPlanetPageContent } from "@/lib/planets/content";

type SessionShellProps = {
  planet: Planet;
  children: ReactNode;
};

export function SessionShell({ planet, children }: SessionShellProps) {
  const content = getPlanetPageContent(planet);

  return (
    <main
      className="planet-page relative flex min-h-dvh w-full flex-col"
      data-atmosphere={content.atmosphere}
      style={{ background: "var(--planet-page-bg, var(--background))" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />
      <div
        className="planet-page-haze pointer-events-none absolute inset-0 opacity-80"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-10 sm:py-12">
        {children}
      </div>
    </main>
  );
}
