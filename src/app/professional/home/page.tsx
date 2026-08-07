import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeNav } from "@/components/home/HomeNav";
import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  getProfessionalContext,
  professionalTypeLabel,
} from "@/lib/professional";
import { formatUsernameDisplay } from "@/lib/profiles/username";

export const metadata: Metadata = {
  title: "Professional — Haelo",
  description: "Haelo professional tools for connections and Orbit recommendations.",
};

export default async function ProfessionalHomePage() {
  const ctx = await getProfessionalContext();
  if (!ctx) {
    redirect("/login/professional?next=/professional/home");
  }
  if (!ctx.isProfessional) {
    return (
      <div className="relative min-h-dvh">
        <HomeNav />
        <main className="mx-auto max-w-lg px-4 pb-28 pt-24 sm:px-6">
          <h1
            className="font-[family-name:var(--font-fraunces)] text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Professional access
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-muted)]">
            This area is for Haelo professional accounts. Your account is a
            personal Haelo account.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <TransitionLink
              href="/home"
              variant="fade"
              className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
            >
              Go to Universe
            </TransitionLink>
            <TransitionLink
              href="/professional"
              variant="fade"
              className="inline-flex justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--violet)]"
              style={{ borderColor: "var(--hairline)" }}
            >
              Learn about professional access
            </TransitionLink>
          </div>
        </main>
        <HomeBottomNav />
      </div>
    );
  }

  const professional = ctx.professional;

  return (
    <div
      className="relative min-h-dvh"
      style={{
        background:
          "radial-gradient(ellipse 70% 40% at 100% 0%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 50%), var(--background)",
      }}
    >
      <HomeNav showProfessional />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-24 sm:px-6">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          Professional
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 84, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          Professional
        </h1>

        {professional ? (
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {professional.displayName}
            {ctx.profile.username
              ? ` · ${formatUsernameDisplay(ctx.profile.username)}`
              : ""}
            {" · "}
            {professionalTypeLabel(professional.professionalType)}
          </p>
        ) : null}

        <section className="mt-8 space-y-4">
          <h2
            className="font-[family-name:var(--font-fraunces)] text-xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Professional tools
          </h2>

          <Link
            href="/settings/connections"
            className="block rounded-2xl border px-5 py-5 transition-colors hover:bg-[var(--violet-soft)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--surface-border)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <p
              className="font-[family-name:var(--font-fraunces)] text-lg"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              Connections
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Find and connect with people who choose to connect with you.
            </p>
          </Link>

          <Link
            href="/professional/recommend"
            className="block rounded-2xl border px-5 py-5 transition-colors hover:bg-[var(--violet-soft)]"
            style={{
              background: "var(--surface)",
              borderColor: "var(--surface-border)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <p
              className="font-[family-name:var(--font-fraunces)] text-lg"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              Recommend an Orbit
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
              Suggest a guided Orbit to someone who has accepted a connection.
            </p>
          </Link>
        </section>
      </main>
      <HomeBottomNav />
    </div>
  );
}
