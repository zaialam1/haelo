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
      className={`inline-flex items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] ${className}`}
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
      className="inline-flex items-center justify-center rounded-full px-5 py-3 text-[0.9375rem] font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 70% 20%, color-mix(in srgb, var(--rose) 22%, transparent), transparent), radial-gradient(ellipse 50% 40% at 15% 80%, color-mix(in srgb, var(--gold) 18%, transparent), transparent)",
            }}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
            <div className="flex flex-col items-start">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Attune
              </p>
              <h1
                className="mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-[2.35rem] leading-[1.12] text-[var(--foreground)] sm:text-[3.15rem]"
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
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <PrimaryCta href="/signup">Start exploring</PrimaryCta>
                <SecondaryCta href="/login">Log in</SecondaryCta>
              </div>
            </div>

            <ContextOrbit />
          </div>
        </section>

        {/* Section 1 — The idea */}
        <section
          className="border-t"
          style={{ borderColor: "var(--hairline)" }}
          aria-labelledby="idea-heading"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--foreground-muted)" }}
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
              }}
            >
              Everyone has more than one voice.
            </h2>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
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
          style={{ borderColor: "var(--hairline)" }}
          aria-labelledby="do-heading"
        >
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-3xl">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
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
              {[
                {
                  name: "School",
                  prompt: "Something you learned this week",
                },
                {
                  name: "Friends",
                  prompt: "Something funny that happened",
                },
                {
                  name: "Family",
                  prompt: "A typical evening at home",
                },
                {
                  name: "Passion",
                  prompt: "Something you love",
                },
                {
                  name: "Challenge",
                  prompt: "Something you are working through",
                },
              ].map((item) => (
                <li
                  key={item.name}
                  className="rounded-3xl border p-5"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--surface-border)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  <p
                    className="font-semibold"
                    style={{ color: "var(--violet)" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {item.prompt}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 3 — What you see */}
        <section
          className="border-t"
          style={{ borderColor: "var(--hairline)" }}
          aria-labelledby="see-heading"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
            <div>
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
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
                own place. Size, color, and presence shift as you grow. No
                rankings. No comparison to anyone else.
              </p>
            </div>
            <ContextOrbit compact />
          </div>
        </section>

        {/* Closing CTA */}
        <section
          id="explore"
          className="border-t"
          style={{ borderColor: "var(--hairline)" }}
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <h2
              id="cta-heading"
              className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2.25rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
                letterSpacing: "-0.015em",
              }}
            >
              Ready to notice your voice?
            </h2>
            <p
              className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Start with a few short recordings. Watch how the map begins to
              take shape.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <PrimaryCta href="/signup">Start exploring</PrimaryCta>
              <SecondaryCta href="/login">Log in</SecondaryCta>
            </div>
            <p
              className="mt-6 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              Your recordings stay private to you.
            </p>
          </div>
        </section>
      </main>

      <footer
        className="border-t py-8"
        style={{ borderColor: "var(--hairline)" }}
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
