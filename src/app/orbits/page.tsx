import type { Metadata } from "next";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNav } from "@/components/home/HomeNav";
import { OrbitsBrowse } from "@/components/orbits/OrbitsBrowse";
import { ORBIT_REGIONS } from "@/lib/orbits/regions";
import { isOrbitRegionKey } from "@/lib/orbits/regions";
import { buildOrbitList } from "@/lib/orbits/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Orbits — Haelo",
  description:
    "Short guided voice experiences for real situations — separate from your planet journey.",
};

type OrbitsPageProps = {
  searchParams: Promise<{ region?: string }>;
};

export default async function OrbitsPage({ searchParams }: OrbitsPageProps) {
  const params = await searchParams;
  const regionKey =
    params.region && isOrbitRegionKey(params.region) ? params.region : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = await buildOrbitList({
    userId: user?.id ?? null,
    regionKey,
  });

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, color-mix(in srgb, var(--rose) 12%, transparent), transparent 65%)",
        }}
        aria-hidden
      />
      <HomeNav />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-28 pt-20 sm:px-6">
        <header className="mb-8">
          <p
            className="text-[0.75rem] font-medium uppercase tracking-[0.14em]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Navigate something happening now
          </p>
          <h1
            className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ color: "var(--foreground)" }}
          >
            Orbits
          </h1>
          <p
            className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Short guided sequences for real-life situations. They practice the
            same four voice skills — without moving your normal planet
            progression.
          </p>
        </header>
        <OrbitsBrowse
          regions={[...ORBIT_REGIONS]}
          items={items}
          activeRegion={regionKey ?? null}
        />
      </main>
      <HomeBottomNav />
    </div>
  );
}
