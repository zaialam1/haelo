import Link from "next/link";
import { ContextOrbit } from "@/components/landing/ContextOrbit";
import { SiteHeader } from "@/components/landing/SiteHeader";

function PrimaryCta({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_35%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${className}`}
    >
      {children}
    </Link>
  );
}

function SecondaryCta({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border-2 border-[var(--violet)] bg-[color-mix(in_srgb,var(--rose)_25%,var(--background))] px-5 py-3 text-[0.9375rem] font-semibold text-[var(--violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--rose)_40%,var(--background))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
    >
      {children}
    </Link>
  );
}

const CONTEXTS = [
  {
    name: "School",
    prompt: "Something you learned this week",
    accent: "var(--violet)",
    wash: "color-mix(in srgb, var(--violet) 14%, var(--background))",
  },
  {
    name: "Friends",
    prompt: "Something funny that happened",
    accent: "var(--rose)",
    wash: "color-mix(in srgb, var(--rose) 28%, var(--background))",
  },
  {
    name: "Family",
    prompt: "A typical evening at home",
    accent: "var(--rose)",
    wash: "color-mix(in srgb, var(--rose) 22%, var(--gold) 12%, var(--background))",
  },
  {
    name: "Passion",
    prompt: "Something you love",
    accent: "var(--gold)",
    wash: "color-mix(in srgb, var(--gold) 38%, var(--background))",
  },
  {
    name: "Challenge",
    prompt: "Something you are working through",
    accent: "var(--violet)",
    wash: "color-mix(in srgb, var(--violet) 18%, var(--rose) 10%, var(--background))",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 85% 10%, color-mix(in srgb, var(--rose) 55%, transparent), transparent 55%), radial-gradient(ellipse 55% 50% at 5% 90%, color-mix(in srgb, var(--gold) 50%, transparent), transparent 50%), radial-gradient(ellipse 45% 40% at 40% 0%, color-mix(in srgb, var(--violet) 28%, transparent), transparent 60%)",
            }}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
            <div className="flex flex-col items-start">
              <p
                className="inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                style={{
                  color: "var(--violet)",
                  backgroundColor:
                    "color-mix(in srgb, var(--gold) 45%, var(--rose) 25%, var(--background))",
                }}
              >
                Attune
              </p>
              <h1
                className="mt-5 max-w-xl font-[family-name:var(--font-fraunces)] text-[2.35rem] leading-[1.12] text-[var(--foreground)] sm:text-[3.15rem]"
                style={{
                  fontVariationSettings:
                    '"opsz" 96, "SOFT" 55, "WONK" 1, "wght" 550',
                  letterSpacing: "-0.02em",
                }}
              >
                You sound different depending on where you are.
              </h1>
              <p
                className="mt-5 max-w-md text-[1.0625rem] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Notice the different versions of your voice — at school, with
                friends, at home, when you care about something, when something
                is hard — and how they grow over time.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryCta href="/signup">Start exploring</PrimaryCta>
                <SecondaryCta href="/login">Log in</SecondaryCta>
              </div>
            </div>

            <ContextOrbit />
          </div>
        </section>

        {/* Section 1 — The idea */}
        <section
          className="relative overflow-hidden border-t"
          style={{
            borderColor: "color-mix(in srgb, var(--rose) 40%, transparent)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--rose) 22%, var(--background)), var(--background))",
          }}
          aria-labelledby="idea-heading"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              The idea
            </p>
            <h2
              id="idea-heading"
              className="mt-3 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2.25rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                letterSpacing: "-0.015em",
                color: "var(--violet)",
              }}
            >
              Everyone has more than one voice.
            </h2>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              You may sound open with friends and quieter in class. More
              expressive when you talk about something you love. Different at
              home. Uncertain when something is hard. That isn&rsquo;t good or
              bad — it&rsquo;s something you can explore.
            </p>
          </div>
        </section>

        {/* Section 2 — What you do */}
        <section
          className="border-t"
          style={{
            borderColor: "color-mix(in srgb, var(--gold) 45%, transparent)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--gold) 18%, var(--background)), var(--background))",
          }}
          aria-labelledby="do-heading"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-3xl">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "var(--violet)" }}
              >
                What you do
              </p>
              <h2
                id="do-heading"
                className="mt-3 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2.25rem]"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                  letterSpacing: "-0.015em",
                }}
              >
                Short recordings across the parts of your life.
              </h2>
              <p
                className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Answer a simple prompt for about a minute. School. Friends.
                Family. Passion. Challenge. Come back when you have a spare
                moment — not as a streak, just as a way to notice yourself.
              </p>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {CONTEXTS.map((item) => (
                <li
                  key={item.name}
                  className="overflow-hidden rounded-3xl border-2"
                  style={{
                    backgroundColor: item.wash,
                    borderColor: `color-mix(in srgb, ${item.accent} 45%, transparent)`,
                    boxShadow: `0 12px 28px color-mix(in srgb, ${item.accent} 18%, transparent)`,
                  }}
                >
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: item.accent }}
                    aria-hidden="true"
                  />
                  <div className="p-5">
                    <p
                      className="font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {item.prompt}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 3 — What you see (no second map) */}
        <section
          className="relative overflow-hidden border-t"
          style={{
            borderColor: "color-mix(in srgb, var(--violet) 35%, transparent)",
            background:
              "radial-gradient(ellipse 70% 80% at 100% 50%, color-mix(in srgb, var(--violet) 22%, transparent), transparent 55%), radial-gradient(ellipse 50% 60% at 0% 80%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 50%), var(--background)",
          }}
          aria-labelledby="see-heading"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              What you see
            </p>
            <h2
              id="see-heading"
              className="mt-3 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2.25rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
                letterSpacing: "-0.015em",
              }}
            >
              A living map of how your voice shows up.
            </h2>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Over time, Attune gathers those recordings into a private map —
              more like a solar system than a report card. Each context is its
              own place. Color, size, and presence shift as you grow. No
              rankings. No comparison to anyone else.
            </p>

            <ul className="mt-10 flex flex-col gap-3">
              {[
                {
                  title: "Each part of your life gets its own place",
                  detail: "School, friends, family, passion, challenge — distinct, not scored.",
                  chip: "var(--violet)",
                },
                {
                  title: "It changes as you do",
                  detail: "Come back over weeks and months and watch the map shift with you.",
                  chip: "var(--rose)",
                },
                {
                  title: "Growth, not grades",
                  detail: "Private to you. No leaderboards. No comparing yourself to anyone else.",
                  chip: "var(--gold)",
                },
              ].map((row) => (
                <li
                  key={row.title}
                  className="flex gap-4 rounded-3xl border-2 p-5"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--background) 70%, white)",
                    borderColor: `color-mix(in srgb, ${row.chip} 40%, transparent)`,
                  }}
                >
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: row.chip,
                      boxShadow: `0 0 0 6px color-mix(in srgb, ${row.chip} 28%, transparent)`,
                    }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                      {row.title}
                    </p>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {row.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing CTA */}
        <section
          id="explore"
          className="border-t"
          style={{
            borderColor: "transparent",
            background:
              "linear-gradient(135deg, var(--violet) 0%, color-mix(in srgb, var(--violet) 75%, var(--rose)) 55%, color-mix(in srgb, var(--rose) 70%, var(--gold)) 100%)",
          }}
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2
              id="cta-heading"
              className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight text-white sm:text-[2.25rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
                letterSpacing: "-0.015em",
              }}
            >
              Ready to notice your voice?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/90">
              Start with a few short recordings. Watch how the map begins to
              take shape.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-warm)] shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start exploring
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-white/15 px-5 py-3 text-[0.9375rem] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Log in
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/85">
              Your recordings stay private to you.
            </p>
          </div>
        </section>
      </main>

      <footer
        className="border-t py-8"
        style={{
          borderColor: "color-mix(in srgb, var(--violet) 20%, transparent)",
          backgroundColor:
            "color-mix(in srgb, var(--rose) 12%, var(--background))",
        }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm sm:flex-row sm:px-8"
          style={{ color: "var(--foreground-muted)" }}
        >
          <p className="font-[family-name:var(--font-fraunces)] text-[var(--violet)]">
            Attune
          </p>
          <p>A private place to notice your voice.</p>
        </div>
      </footer>
    </div>
  );
}
