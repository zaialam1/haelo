import type { Metadata } from "next";
import Link from "next/link";
import { getTopicById } from "@/lib/home/universe";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  const name = topic?.label ?? "Topic";
  return {
    title: `${name} — Haelo`,
    description: `Explore ${name} in your conversation universe.`,
  };
}

export default async function TopicStubPage({ params }: TopicPageProps) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  const name = topic?.label ?? topicId;

  return (
    <main
      className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-5 py-16 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--violet) 25%, transparent), transparent 55%), var(--background)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Planet
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        {name}
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Planet detail is coming soon. You&rsquo;ll explore subtopics, a
        recording timeline, and growth notes here.
      </p>
      {topic && (
        <span
          className="mt-6 inline-block size-10 rounded-full"
          style={{
            background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, #fff8f0 55%, ${topic.color}), ${topic.color})`,
            boxShadow: `0 0 16px color-mix(in srgb, ${topic.color} 50%, transparent)`,
          }}
          aria-hidden="true"
        />
      )}
      <Link
        href="/home"
        className="mt-8 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        Back to universe
      </Link>
    </main>
  );
}
