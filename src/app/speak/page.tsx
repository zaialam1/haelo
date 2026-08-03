import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Start Speaking — Haelo",
  description: "Begin a speaking session in Haelo.",
};

export default function SpeakStubPage() {
  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-5 py-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--gold) 30%, transparent), transparent 55%), var(--background)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Session
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        Start Speaking
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Speaking session flow is coming soon — prompt selection, recording, and
        reflection will live here.
      </p>
      <Link
        href="/home"
        className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        Back to universe
      </Link>
    </main>
  );
}
