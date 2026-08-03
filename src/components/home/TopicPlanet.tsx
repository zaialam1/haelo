"use client";

import Link from "next/link";
import type { TopicPlanet } from "@/lib/home/universe";
import { planetSizePx } from "@/lib/home/universe";

type TopicPlanetOrbProps = {
  topic: TopicPlanet;
  /** Stagger float so planets don’t bob in sync */
  floatDelaySec?: number;
};

export function TopicPlanetOrb({
  topic,
  floatDelaySec = 0,
}: TopicPlanetOrbProps) {
  const px = planetSizePx(topic.size);
  const floatDuration = 4.2 + (floatDelaySec % 1.6);

  return (
    <Link
      href={`/topics/${topic.id}`}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
      style={{
        left: `${topic.x}%`,
        top: `${topic.y}%`,
      }}
      aria-label={`Explore ${topic.label}`}
    >
      <span
        className="flex flex-col items-center gap-1.5 motion-reduce:animate-none"
        style={{
          animation: `planet-float ${floatDuration}s ease-in-out ${floatDelaySec}s infinite`,
        }}
      >
        <span
          className="block shrink-0 rounded-full"
          style={{
            width: px,
            height: px,
            background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, #fff8f0 55%, ${topic.color}), ${topic.color})`,
            opacity: topic.brightness,
            boxShadow: `0 0 ${8 + topic.glow * 20}px color-mix(in srgb, ${topic.color} 55%, transparent)`,
          }}
        />
        <span
          className="max-w-[5.5rem] text-center text-[0.6875rem] font-medium leading-tight sm:text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          {topic.label}
        </span>
      </span>
    </Link>
  );
}
