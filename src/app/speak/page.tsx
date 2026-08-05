import type { Metadata } from "next";
import Link from "next/link";
import { SpeakSession } from "@/components/speak/SpeakSession";
import { resolveSpeakSession } from "@/lib/questions/sessions";

export const metadata: Metadata = {
  title: "Start Speaking — Haelo",
  description: "Begin a speaking session in Haelo.",
};

type SpeakPageProps = {
  searchParams: Promise<{
    mode?: string;
    topicId?: string;
    q?: string;
    planet?: string;
  }>;
};

export default async function SpeakPage({ searchParams }: SpeakPageProps) {
  const params = await searchParams;
  const resolved = resolveSpeakSession(params);

  if ("error" in resolved) {
    return (
      <main
        className="flex min-h-dvh w-full flex-col px-5 py-8 sm:px-10 sm:py-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, color-mix(in srgb, var(--rose) 18%, transparent), transparent 50%), var(--background)",
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Session
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Something&rsquo;s off
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {resolved.error}
          </p>
          <Link
            href="/home"
            className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Back to universe
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-dvh w-full flex-col"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, color-mix(in srgb, var(--rose) 16%, transparent), transparent 50%), radial-gradient(ellipse 40% 35% at 100% 80%, color-mix(in srgb, var(--violet) 12%, transparent), transparent 50%), var(--background)",
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8 sm:px-10 sm:py-12">
        <SpeakSession
          mode={resolved.mode}
          questions={resolved.questions}
          doneHref={resolved.doneHref}
          planetLabel={resolved.planetLabel}
        />
      </div>
    </main>
  );
}
