import type { Metadata } from "next";
import { TransitionLink } from "@/components/transitions/TransitionLink";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export function ComingSoonPage({
  title,
  description = "This part of Haelo is on its way. Come back soon.",
}: ComingSoonPageProps) {
  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16"
      style={{ background: "var(--universe-page)" }}
    >
      <div
        className="universe-starfield pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-4 text-center">
        <p
          className="font-[family-name:var(--font-fraunces)] text-sm tracking-tight text-[var(--violet)]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Haelo
        </p>
        <h1
          className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight text-[var(--foreground)] sm:text-4xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          {title}
        </h1>
        <p
          className="text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--foreground-muted)" }}
        >
          Coming soon.
        </p>
        <p
          className="max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          {description}
        </p>
        <TransitionLink
          href="/home"
          variant="fade"
          className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background: "var(--violet)",
            color: "var(--on-violet)",
          }}
        >
          Back to Universe
        </TransitionLink>
      </div>
    </main>
  );
}

export function comingSoonMetadata(title: string): Metadata {
  return {
    title: `${title} — Haelo`,
    description: `${title} is coming soon in Haelo.`,
  };
}
