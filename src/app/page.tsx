"use client";

import { ContextOrbit } from "@/components/landing/ContextOrbit";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { TransitionLink } from "@/components/transitions/TransitionLink";

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
    <TransitionLink
      href={href}
      variant="fade"
      className={`inline-flex items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_35%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${className}`}
    >
      {children}
    </TransitionLink>
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
    <TransitionLink
      href={href}
      variant="fade"
      className="inline-flex items-center justify-center rounded-full border-2 border-[var(--violet)] bg-[color-mix(in_srgb,var(--rose)_25%,var(--background))] px-5 py-3 text-[0.9375rem] font-semibold text-[var(--violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--rose)_40%,var(--background))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
    >
      {children}
    </TransitionLink>
  );
}

const PLANETS = [
  {
    name: "Express",
    prompt: "Say what you really think and feel",
    accent: "var(--rose)",
    wash: "color-mix(in srgb, var(--rose) 28%, var(--background))",
  },
  {
    name: "Stand",
    prompt: "Speak up and stand behind what you believe",
    accent: "var(--violet)",
    wash: "color-mix(in srgb, var(--violet) 14%, var(--background))",
  },
  {
    name: "Connect",
    prompt: "Build confidence communicating with other people",
    accent: "var(--rose)",
    wash: "color-mix(in srgb, var(--rose) 22%, var(--gold) 12%, var(--background))",
  },
  {
    name: "Explore",
    prompt: "Discover what you think and what matters to you",
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
                Haelo
              </p>
              <h1
                className="mt-5 max-w-xl font-[family-name:var(--font-fraunces)] text-[2.35rem] leading-[1.12] text-[var(--foreground)] sm:text-[3.15rem]"
                style={{
                  fontVariationSettings:
                    '"opsz" 96, "SOFT" 55, "WONK" 1, "wght" 550',
                  letterSpacing: "-0.02em",
                }}
              >
                Practice using your voice — and watch it grow.
              </h1>
              <p
                className="mt-5 max-w-md text-[1.0625rem] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Short speaking sessions across Express, Stand, Connect, and
                Explore. Over time, every session becomes part of your personal
                constellation.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <PrimaryCta href="/signup">Start exploring</PrimaryCta>
                <SecondaryCta href="/login">Log in</SecondaryCta>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-[var(--foreground-muted)]">
                Using Haelo with students or clients?{" "}
                <TransitionLink
                  href="/professional"
                  variant="fade"
                  className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                >
                  Professional access →
                </TransitionLink>
              </p>
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
              Your voice has different strengths to grow.
            </h2>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              Sometimes you need to say what you feel. Sometimes you need to
              stand behind an opinion. Sometimes you need to connect with
              someone else — or figure out what you actually think. Haelo gives
              you a calm place to practice each of those.
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
                Short speaking sessions on four planets.
              </h2>
              <p
                className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Pick a planet, answer a prompt out loud, and save the moment.
                Come back when you have a spare minute — not as a streak, just
                as a way to practice being yourself.
              </p>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLANETS.map((item) => (
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

        {/* Section 3 — What you see */}
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
              A universe to practice in — and a journey that grows with you.
            </h2>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Your home is a private universe of four planets. As you complete
              sessions, Journey gathers them into a constellation — the story of
              how your voice develops over time. No rankings. No comparison to
              anyone else.
            </p>

            <ul className="mt-10 flex flex-col gap-3">
              {[
                {
                  title: "Universe — where you grow next",
                  detail:
                    "Choose Express, Stand, Connect, or Explore when you want to practice.",
                  chip: "var(--violet)",
                },
                {
                  title: "Journey — what you’ve practiced",
                  detail:
                    "Every completed session becomes a star in your constellation.",
                  chip: "var(--rose)",
                },
                {
                  title: "Growth, not grades",
                  detail:
                    "Private to you. No leaderboards. No comparing yourself to anyone else.",
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
              Ready to practice your voice?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-white/90">
              Start with a few short sessions. Watch your constellation begin to
              take shape.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <TransitionLink
                variant="fade"
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[var(--gold)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-warm)] shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start exploring
              </TransitionLink>
              <TransitionLink
                variant="fade"
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/80 bg-white/15 px-5 py-3 text-[0.9375rem] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Log in
              </TransitionLink>
            </div>
            <p className="mt-6 text-sm text-white/85">
              Your recordings stay private to you.
            </p>
            <p className="mt-4 text-sm text-white/80">
              Using Haelo with students or clients?{" "}
              <TransitionLink
                href="/professional"
                variant="fade"
                className="font-semibold text-white underline-offset-2 hover:underline"
              >
                Professional access →
              </TransitionLink>
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
            Haelo
          </p>
          <p>A private place to practice your voice.</p>
        </div>
      </footer>
    </div>
  );
}
