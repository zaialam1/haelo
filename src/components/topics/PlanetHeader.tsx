"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { FocusSectionButton } from "@/components/topics/FocusSectionButton";
import type { SummaryInsight, TopicCatalogEntry } from "@/lib/topics/types";

type PlanetHeaderProps = {
  topic: TopicCatalogEntry;
  insights: SummaryInsight[];
};

export function PlanetHeader({ topic, insights }: PlanetHeaderProps) {
  return (
    <header className="relative z-10 px-5 pt-6 sm:px-8 sm:pt-8">
      <TransitionLink
        href="/home"
        variant="fade"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        style={{ color: "var(--violet)" }}
      >
        <span aria-hidden="true">←</span>
        Back to Map
      </TransitionLink>

      <div className="mt-5 flex items-start gap-4">
        <span
          className="mt-1 size-10 shrink-0 rounded-full sm:size-12"
          style={{
            background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, #fff8f0 55%, ${topic.color}), ${topic.color})`,
            boxShadow: `0 0 20px color-mix(in srgb, ${topic.color} 45%, transparent)`,
          }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h1
            className="font-[family-name:var(--font-fraunces)] text-[1.75rem] leading-tight sm:text-3xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
              color: "var(--foreground)",
            }}
          >
            {topic.label}
          </h1>
          <p
            className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed sm:text-base"
            style={{ color: "var(--foreground-muted)" }}
          >
            {topic.tagline}
          </p>
          <FocusSectionButton topic={topic} />
        </div>
      </div>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-8">
        {insights.map((insight) => (
          <li key={insight.label} className="min-w-0">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase"
              style={{ color: "var(--foreground-muted)" }}
            >
              {insight.label}
            </p>
            <p
              className="mt-0.5 text-sm"
              style={{
                color: insight.isPlaceholder
                  ? "var(--foreground-muted)"
                  : "var(--foreground)",
                opacity: insight.isPlaceholder ? 0.7 : 1,
              }}
            >
              {insight.value}
            </p>
          </li>
        ))}
      </ul>
    </header>
  );
}
