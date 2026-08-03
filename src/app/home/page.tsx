import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home — Attune",
  description: "Placeholder for the future logged-in Attune experience.",
};

/**
 * Minimal placeholder only. Not the real authenticated Attune homepage.
 */
export default function HomePlaceholderPage() {
  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-5 py-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 100% 0%, color-mix(in srgb, var(--rose) 25%, transparent), transparent 50%), var(--background)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Placeholder
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        You&rsquo;re in Attune
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Age verification cleared for this prototype. The real logged-in home,
        Voice Map, and recordings are not built yet — this page is only a
        destination so the signup flow has somewhere to land.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        Back to public homepage
      </Link>
    </main>
  );
}
