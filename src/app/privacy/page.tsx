import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Haelo",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <h1
        className="font-[family-name:var(--font-fraunces)] text-3xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        Privacy Policy
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Coming soon. We&rsquo;ll publish a real Privacy Policy before Haelo
        stores voice recordings or account data.
      </p>
      <Link
        href="/signup"
        className="mt-8 inline-flex text-sm font-semibold text-[var(--violet)] underline-offset-4 hover:underline"
      >
        ← Back to create account
      </Link>
    </main>
  );
}
