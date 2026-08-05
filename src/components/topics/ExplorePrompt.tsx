"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import type { TopicCatalogEntry } from "@/lib/topics/types";

type ExplorePromptProps = {
  topic: TopicCatalogEntry;
};

export function ExplorePrompt({ topic }: ExplorePromptProps) {
  return (
    <section
      className="planet-explore-card relative z-10 mx-5 mb-10 rounded-3xl px-5 py-6 sm:mx-8 sm:px-7 sm:py-7"
      style={{
        background:
          "linear-gradient(145deg, color-mix(in srgb, var(--violet) 12%, var(--surface)), color-mix(in srgb, var(--rose) 10%, var(--surface)))",
        border: "1px solid var(--surface-border)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Keep exploring {topic.label}
      </p>
      <p
        className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
          color: "var(--foreground)",
        }}
      >
        &ldquo;{topic.explorePrompt}&rdquo;
      </p>
      <TransitionLink
        href={`/speak?topicId=${encodeURIComponent(topic.id)}`}
        variant="fade"
        className="planet-explore-cta mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        Record a reflection
        <span aria-hidden="true">→</span>
      </TransitionLink>
    </section>
  );
}
