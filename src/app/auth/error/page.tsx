import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Auth error — Haelo",
  description: "Something went wrong confirming your account.",
};

export default function AuthErrorPage() {
  return (
    <AuthShell
      brand={
        <>
          <p
            className="inline-flex rounded-full px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{
              color: "var(--violet)",
              backgroundColor:
                "color-mix(in srgb, var(--gold) 45%, var(--rose) 25%, var(--background))",
            }}
          >
            Link issue
          </p>
          <h2
            className="mt-5 font-[family-name:var(--font-fraunces)] text-[2.15rem] leading-tight text-[var(--violet)] sm:text-[2.6rem]"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 55, "WONK" 1, "wght" 550',
              letterSpacing: "-0.02em",
            }}
          >
            That link didn&rsquo;t work.
          </h2>
          <p
            className="mt-4 max-w-md text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            Confirmation links from the default Supabase email need a small
            template update for Next.js, or the link was opened in a different
            browser than the one you used to sign up.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <h1
          className="font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight text-[var(--foreground)] sm:text-[2rem]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            letterSpacing: "-0.015em",
          }}
        >
          Couldn&rsquo;t confirm
        </h1>
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
          In the Supabase dashboard, open{" "}
          <span className="font-semibold text-[var(--foreground)]">
            Authentication → Email Templates → Confirm sign up
          </span>{" "}
          and set the button link to your{" "}
          <code className="text-[var(--foreground)]">/auth/confirm</code> URL
          with <code className="text-[var(--foreground)]">token_hash</code> (see
          the setup notes from this session). Then request a new confirmation
          email.
        </p>
        <Link
          href="/signup"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Back to Sign up
        </Link>
        <p className="text-center text-sm text-[var(--foreground)]">
          Already confirmed?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--violet)] underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
