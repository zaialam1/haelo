import type { Metadata } from "next";
import Link from "next/link";
import { SHOOTING_STAR_PROMPTS } from "@/lib/home/universe";

type PromptPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PromptPageProps): Promise<Metadata> {
  const { id } = await params;
  const prompt = SHOOTING_STAR_PROMPTS.find((p) => p.id === id);
  return {
    title: `${prompt?.label ?? "Prompt"} — Haelo`,
    description: "A surprise prompt from your conversation universe.",
  };
}

export default async function PromptStubPage({ params }: PromptPageProps) {
  const { id } = await params;
  const prompt = SHOOTING_STAR_PROMPTS.find((p) => p.id === id);
  const label = prompt?.label ?? "Surprise prompt";

  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-5 py-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%), var(--background)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Shooting star
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        {label}
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Reflection prompts, fun facts, challenges, and tiny rewards will appear
        here soon.
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
