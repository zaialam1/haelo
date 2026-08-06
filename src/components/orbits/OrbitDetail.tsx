import { TransitionLink } from "@/components/transitions/TransitionLink";
import { beginOrbitAction } from "@/lib/orbits/actions";
import type { OrbitDefinition, UserOrbitProgressRow } from "@/lib/orbits/types";
import type { Planet } from "@/lib/prompts";

const PLANET_LABEL: Record<Planet, string> = {
  express: "Express",
  stand: "Stand",
  connect: "Connect",
  explore: "Explore",
};

export function OrbitDetail({
  orbit,
  regionTitle,
  durationLabel,
  planetSequence,
  planetsInvolved,
  progress,
  signedIn,
}: {
  orbit: OrbitDefinition;
  regionTitle: string;
  durationLabel: string;
  planetSequence: Planet[];
  planetsInvolved: Planet[];
  progress: UserOrbitProgressRow | null;
  signedIn: boolean;
}) {
  const status = progress?.status ?? "not_started";
  const cta =
    status === "completed"
      ? "View progress"
      : status === "in_progress"
        ? "Continue Orbit"
        : "Begin Orbit";

  return (
    <article>
      <TransitionLink
        href={`/orbits?region=${orbit.regionKey}`}
        variant="fade"
        className="text-[0.75rem] font-medium"
        style={{ color: "var(--violet)" }}
      >
        ← {regionTitle}
      </TransitionLink>

      <p
        className="mt-6 text-[0.75rem] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--foreground-muted)" }}
      >
        Orbit · {durationLabel}
      </p>
      <h1
        className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl"
        style={{ color: "var(--foreground)" }}
      >
        {orbit.openingTitle}
      </h1>

      <div
        className="mt-5 space-y-4 whitespace-pre-line text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {orbit.openingBody}
      </div>

      <p
        className="mt-6 text-[0.8125rem]"
        style={{ color: "var(--foreground-muted)" }}
      >
        Skills in this Orbit:{" "}
        {planetsInvolved.map((p) => PLANET_LABEL[p]).join(" · ")}
      </p>

      <form action={beginOrbitAction} className="mt-8">
        <input type="hidden" name="orbitKey" value={orbit.orbitKey} />
        {signedIn ? (
          <button
            type="submit"
            className="rounded-full px-6 py-3 text-[0.875rem] font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "var(--violet)",
              color: "var(--background)",
            }}
          >
            {cta}
          </button>
        ) : (
          <TransitionLink
            href={`/login?next=${encodeURIComponent(`/orbits/${orbit.orbitKey}`)}`}
            variant="fade"
            className="inline-block rounded-full px-6 py-3 text-[0.875rem] font-semibold"
            style={{
              background: "var(--violet)",
              color: "var(--background)",
            }}
          >
            Sign in to begin
          </TransitionLink>
        )}
      </form>

      {status === "in_progress" && progress ? (
        <p
          className="mt-3 text-[0.8125rem]"
          style={{ color: "var(--foreground-muted)" }}
        >
          You&apos;re on question {progress.current_question_index} of 6.
          Recording for Orbit questions will use the shared session flow next.
        </p>
      ) : null}

      {status === "completed" ? (
        <p
          className="mt-3 text-[0.8125rem]"
          style={{ color: "var(--foreground-muted)" }}
        >
          You&apos;ve completed this Orbit. Summative analysis will appear here
          once generation is wired.
        </p>
      ) : null}

      <section className="mt-12">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Six questions
        </h2>
        <ol className="mt-4 space-y-3">
          {orbit.questions.map((q, index) => {
            const done =
              status === "completed" ||
              (progress != null &&
                progress.current_question_index > q.sequenceNumber);
            const current =
              status === "in_progress" &&
              progress?.current_question_index === q.sequenceNumber;
            return (
              <li
                key={q.questionKey}
                className="rounded-xl px-4 py-3"
                style={{
                  background: current
                    ? "color-mix(in srgb, var(--violet) 12%, transparent)"
                    : "color-mix(in srgb, var(--foreground) 3%, transparent)",
                  border: current
                    ? "1px solid color-mix(in srgb, var(--violet) 28%, transparent)"
                    : "1px solid transparent",
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-[0.6875rem] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--violet)" }}
                  >
                    Q{q.sequenceNumber} · {PLANET_LABEL[q.planet]}
                    {done ? " · done" : current ? " · now" : ""}
                  </span>
                </div>
                <p
                  className="mt-1 text-[0.9375rem] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {q.prompt}
                </p>
                <p
                  className="mt-1 text-[0.8125rem] leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {q.explanation}
                </p>
                <p className="sr-only">
                  Sequence planet {index + 1}: {planetSequence[index]}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
}
