import type { Metadata } from "next";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { SiteHeader } from "@/components/landing/SiteHeader";

export const metadata: Metadata = {
  title: "Haelo for Professionals",
  description:
    "Help young people practice communication through guided Haelo Orbits — while their private voice work stays private.",
};

export default function ProfessionalInfoPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 90% 0%, color-mix(in srgb, var(--gold) 40%, transparent), transparent 55%), radial-gradient(ellipse 50% 45% at 10% 80%, color-mix(in srgb, var(--rose) 35%, transparent), transparent 50%), var(--background)",
            }}
          />
          <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              Haelo for Professionals
            </p>
            <h1
              className="mt-4 font-[family-name:var(--font-fraunces)] text-[2.35rem] leading-tight sm:text-[3rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 96, "SOFT" 55, "WONK" 1, "wght" 550',
                letterSpacing: "-0.02em",
              }}
            >
              Help young people practice the conversations that matter.
            </h1>
            <p
              className="mt-5 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Haelo helps young people reflect, practice communication, and
              build their voice through guided experiences called Orbits.
              Professionals can eventually recommend relevant Orbits while the
              young person&rsquo;s recordings, Journey, and analyses remain
              private.
            </p>

            <h2
              className="mt-12 font-[family-name:var(--font-fraunces)] text-[1.5rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              What professional access will allow
            </h2>
            <ul className="mt-5 space-y-3 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              {[
                "Explore Haelo yourself",
                "Browse all Orbits",
                "Connect with people who choose to connect with you",
                "Recommend relevant Orbits",
                "Keep the user’s private voice work private",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    className="mt-2 size-2 shrink-0 rounded-full"
                    style={{ background: "var(--violet)" }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <TransitionLink
                href="/signup/professional"
                variant="fade"
                className="inline-flex items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90"
              >
                Create professional account
              </TransitionLink>
              <TransitionLink
                href="/login/professional"
                variant="fade"
                className="inline-flex items-center justify-center rounded-full border-2 border-[var(--violet)] bg-[color-mix(in_srgb,var(--rose)_18%,var(--background))] px-5 py-3 text-[0.9375rem] font-semibold text-[var(--violet)]"
              >
                Professional login
              </TransitionLink>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-[var(--foreground-muted)]">
              A professional account is still a full Haelo account. You can use
              Universe, Journey, and Orbits yourself — so you understand what
              you may later recommend.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
