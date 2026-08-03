"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: "color-mix(in srgb, var(--rose) 35%, transparent)",
        backgroundColor:
          "color-mix(in srgb, var(--rose) 12%, var(--background) 88%)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-xl tracking-tight text-[var(--violet)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--violet)]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Haelo
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--rose)_30%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:px-4"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[var(--violet)] px-4 py-2 text-sm font-semibold text-[var(--on-violet)] shadow-[0_6px_18px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start exploring
          </Link>
        </nav>
      </div>
    </header>
  );
}
