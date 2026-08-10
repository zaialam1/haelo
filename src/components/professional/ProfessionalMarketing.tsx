import { TransitionLink } from "@/components/transitions/TransitionLink";
import { SiteHeader } from "@/components/landing/SiteHeader";

type Props = {
  compact?: boolean;
};

export function ProfessionalMarketing({ compact = false }: Props) {
  const body = (
    <section className="relative overflow-hidden">
      {!compact ? (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 90% 0%, color-mix(in srgb, var(--gold) 40%, transparent), transparent 55%), radial-gradient(ellipse 50% 45% at 10% 80%, color-mix(in srgb, var(--rose) 35%, transparent), transparent 50%), var(--background)",
          }}
        />
      ) : null}
      <div
        className={`relative mx-auto max-w-3xl ${compact ? "px-0 py-8" : "px-5 py-16 sm:px-8 sm:py-24"}`}
      >
        {!compact ? (
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Haelo for Professionals
          </p>
        ) : null}
        <h1
          className={`font-[family-name:var(--font-fraunces)] ${compact ? "mt-0 text-2xl" : "mt-4 text-[2.35rem] leading-tight sm:text-[3rem]"}`}
          style={{
            fontVariationSettings: compact
              ? '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550'
              : '"opsz" 96, "SOFT" 55, "WONK" 1, "wght" 550',
            letterSpacing: compact ? undefined : "-0.02em",
          }}
        >
          {compact
            ? "Learn about professional access"
            : "Help young people practice the conversations that matter."}
        </h1>
        <p
          className="mt-5 text-[1.0625rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          A Professional Account is still a full Haelo account — Universe,
          Journey, Orbits, and My Voice — with an additional layer for
          connecting with people and recommending Orbits. Private voice work
          stays private.
        </p>

        {!compact ? (
          <>
            <h2
              className="mt-12 font-[family-name:var(--font-fraunces)] text-[1.5rem]"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              What professional access allows
            </h2>
            <ul
              className="mt-5 space-y-3 text-[1.0625rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              {[
                "Explore Haelo yourself",
                "Browse all Orbits",
                "Connect with people who choose to connect with you",
                "Recommend relevant Orbits",
                "Keep each person’s private voice work private",
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
          </>
        ) : null}

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

        {!compact ? (
          <p className="mt-8 text-sm leading-relaxed text-[var(--foreground-muted)]">
            Switch between Personal and Professional Mode anytime. Personal Mode
            is your own universe of voice; Professional Mode is a constellation of
            connections and paths you can help point people toward.
          </p>
        ) : null}
      </div>
    </section>
  );

  if (compact) return body;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">{body}</main>
    </div>
  );
}
