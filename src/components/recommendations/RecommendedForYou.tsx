import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import type { OrbitRecommendation } from "@/lib/recommendations/types";

export function RecommendedForYou({
  recommendations,
}: {
  recommendations: OrbitRecommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="recommended-for-you-heading">
      <h2
        id="recommended-for-you-heading"
        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight sm:text-xl"
        style={{
          color: "var(--foreground)",
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
        }}
      >
        Recommended for you
      </h2>
      <ul className="mt-3 space-y-3">
        {recommendations.slice(0, 6).map((rec) => {
          const orbit = getOrbitByKey(rec.orbitKey);
          if (!orbit) return null;
          const by = rec.professionalUsername
            ? formatUsernameDisplay(rec.professionalUsername)
            : "Previously recommended";
          return (
            <li
              key={rec.id}
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: "var(--surface-border)",
                background: "var(--surface)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <p
                className="font-[family-name:var(--font-fraunces)] text-base"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
                }}
              >
                {orbit.title}
              </p>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Recommended by {by}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
                {rec.purpose}
              </p>
              <TransitionLink
                href={`/orbits/recommended/${rec.id}`}
                variant="fade"
                className="mt-3 inline-flex text-sm font-semibold text-[var(--violet)]"
              >
                View recommendation →
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
