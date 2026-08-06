import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RecordingSession } from "@/components/recording/RecordingSession";
import { getPlanetPageContent } from "@/lib/planets/content";
import { getPromptById, isPlanet } from "@/lib/prompts";
import { resolvePlanetSessionPrompt } from "@/lib/sessions/resolvePrompt";
import { createClient } from "@/lib/supabase/server";

type SessionPageProps = {
  params: Promise<{ planet: string }>;
  searchParams: Promise<{ prompt?: string }>;
};

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { planet } = await params;
  if (!isPlanet(planet)) {
    return { title: "Session — Haelo" };
  }
  const content = getPlanetPageContent(planet);
  return {
    title: `${content.label} Session — Haelo`,
    description: `Record a ${content.label} practice session.`,
  };
}

export default async function SessionPage({
  params,
  searchParams,
}: SessionPageProps) {
  const { planet: planetParam } = await params;
  const { prompt: promptParam } = await searchParams;

  if (!isPlanet(planetParam)) {
    return (
      <main
        className="flex min-h-dvh w-full flex-col px-5 py-8 sm:px-10 sm:py-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%), var(--background)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Session
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Planet not found
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            That session link isn&rsquo;t valid. Choose Express, Stand, Connect,
            or Explore from your Universe.
          </p>
          <Link
            href="/home"
            className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Back to Universe
          </Link>
        </div>
      </main>
    );
  }

  const planet = planetParam;
  const content = getPlanetPageContent(planet);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next =
      promptParam && getPromptById(promptParam)?.planet === planet
        ? `/session/${planet}?prompt=${encodeURIComponent(promptParam)}`
        : `/session/${planet}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  let promptPayload: { id: string; text: string };
  try {
    // Honor the prompt previewed on the planet page when the ID is valid.
    const fromPlanet = promptParam ? getPromptById(promptParam) : undefined;
    if (fromPlanet && fromPlanet.planet === planet) {
      promptPayload = {
        id: fromPlanet.id,
        text: fromPlanet.prompt,
      };
    } else {
      const resolved = await resolvePlanetSessionPrompt(user.id, planet);
      promptPayload = {
        id: resolved.prompt.id,
        text: resolved.prompt.prompt,
      };
    }
  } catch (e) {
    console.error("[session] prompt resolve failed:", e);
    return (
      <main
        className="flex min-h-dvh w-full flex-col px-5 py-8 sm:px-10 sm:py-10"
        style={{ background: "var(--planet-page-bg, var(--background))" }}
        data-atmosphere={content.atmosphere}
      >
        <div className="planet-page mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
          <h1
            className="font-[family-name:var(--font-fraunces)] text-3xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Couldn&rsquo;t load a prompt
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Please try again in a moment.
          </p>
          <Link
            href={`/${planet}`}
            className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
          >
            Return to {content.label}
          </Link>
        </div>
      </main>
    );
  }

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
        <RecordingSession planet={planet} prompt={promptPayload} />
      </div>
    </main>
  );
}
