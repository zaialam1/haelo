"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ORBIT_REGIONS } from "@/lib/orbits/regions";
import { getOrbitByKey, getActiveOrbits } from "@/lib/orbits/catalog";
import type { OrbitRegionKey } from "@/lib/orbits/types";
import {
  MESSAGE_MAX_LENGTH,
  PURPOSE_MAX_LENGTH,
} from "@/lib/recommendations/types";
import { sendOrbitRecommendationAction } from "@/lib/recommendations/actions";
import { formatUsernameDisplay } from "@/lib/profiles/username";

type ConnectionOption = {
  userId: string;
  username: string | null;
  connectionId: string;
};

type SentItem = {
  id: string;
  orbitKey: string;
  purpose: string;
  createdAt: string;
  recipientUsername?: string | null;
};

type Step = "compose" | "confirm" | "done";

export function RecommendOrbitClient({
  connections,
  sent,
}: {
  connections: ConnectionOption[];
  sent: SentItem[];
}) {
  const router = useRouter();
  const [recipientUserId, setRecipientUserId] = useState(
    connections[0]?.userId ?? "",
  );
  const [region, setRegion] = useState<OrbitRegionKey | "">("");
  const [orbitKey, setOrbitKey] = useState("");
  const [purpose, setPurpose] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [step, setStep] = useState<Step>("compose");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orbitsInRegion = useMemo(() => {
    if (!region) return [];
    return getActiveOrbits()
      .filter((o) => o.regionKey === region)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [region]);

  const selectedOrbit = orbitKey ? getOrbitByKey(orbitKey) : null;
  const selectedRecipient = connections.find((c) => c.userId === recipientUserId);

  async function onConfirmSend() {
    if (!recipientUserId || !orbitKey) return;
    setSubmitting(true);
    setError(null);
    const result = await sendOrbitRecommendationAction({
      recipientUserId,
      orbitKey,
      purpose,
      personalMessage: personalMessage.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      setStep("compose");
      return;
    }
    setStep("done");
    router.refresh();
  }

  if (connections.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
          Connect with someone first. Once they accept, you can recommend an
          Orbit to them here.
        </p>
        <TransitionLink
          href="/professional/connections"
          variant="fade"
          className="inline-flex rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
        >
          Open Connections
        </TransitionLink>
      </div>
    );
  }

  if (step === "done" && selectedOrbit && selectedRecipient) {
    return (
      <div className="space-y-4">
        <h2
          className="font-[family-name:var(--font-fraunces)] text-xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          Recommendation sent
        </h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          {selectedOrbit.title} was recommended to{" "}
          {formatUsernameDisplay(selectedRecipient.username ?? "someone")}.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
            onClick={() => {
              setPurpose("");
              setPersonalMessage("");
              setOrbitKey("");
              setStep("compose");
            }}
          >
            Recommend another
          </button>
          <TransitionLink
            href="/professional"
            variant="fade"
            className="inline-flex justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--violet)]"
            style={{ borderColor: "var(--hairline)" }}
          >
            Back to Professional
          </TransitionLink>
        </div>
      </div>
    );
  }

  if (step === "confirm" && selectedOrbit && selectedRecipient) {
    return (
      <div className="space-y-5">
        <h2
          className="font-[family-name:var(--font-fraunces)] text-xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          Recommend {selectedOrbit.title} to{" "}
          {formatUsernameDisplay(selectedRecipient.username ?? "someone")}?
        </h2>
        <div
          className="rounded-2xl border px-4 py-4 text-sm"
          style={{
            borderColor: "var(--surface-border)",
            background: "var(--surface)",
          }}
        >
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)]">
            Purpose
          </p>
          <p className="mt-1 text-[var(--foreground)]">{purpose}</p>
          {personalMessage.trim() ? (
            <>
              <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--foreground-muted)]">
                Note
              </p>
              <p className="mt-1 text-[var(--foreground)]">
                &ldquo;{personalMessage.trim()}&rdquo;
              </p>
            </>
          ) : null}
        </div>
        {error ? (
          <p className="text-sm text-[#9B2C2C]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirmSend}
            className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-70"
          >
            {submitting ? "Sending…" : "Send recommendation"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setStep("compose")}
            className="inline-flex justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--violet)]"
            style={{ borderColor: "var(--hairline)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Send to
        </label>
        <ul className="mt-2 space-y-2">
          {connections.map((c) => {
            const selected = c.userId === recipientUserId;
            return (
              <li key={c.connectionId}>
                <button
                  type="button"
                  onClick={() => setRecipientUserId(c.userId)}
                  className="w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors"
                  style={{
                    borderColor: selected
                      ? "color-mix(in srgb, var(--violet) 45%, transparent)"
                      : "var(--surface-border)",
                    background: selected
                      ? "var(--violet-soft)"
                      : "var(--surface)",
                    color: "var(--foreground)",
                  }}
                >
                  {formatUsernameDisplay(c.username ?? "user")}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Region
        </label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ORBIT_REGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setRegion(r.key);
                setOrbitKey("");
              }}
              className="rounded-2xl border px-3 py-3 text-left text-sm"
              style={{
                borderColor:
                  region === r.key
                    ? "color-mix(in srgb, var(--violet) 45%, transparent)"
                    : "var(--surface-border)",
                background:
                  region === r.key ? "var(--violet-soft)" : "var(--surface)",
              }}
            >
              <span className="font-semibold">{r.title}</span>
            </button>
          ))}
        </div>
      </div>

      {region ? (
        <div>
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Orbit
          </label>
          <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
            {orbitsInRegion.map((o) => (
              <li key={o.orbitKey}>
                <button
                  type="button"
                  onClick={() => setOrbitKey(o.orbitKey)}
                  className="w-full rounded-2xl border px-4 py-3 text-left"
                  style={{
                    borderColor:
                      orbitKey === o.orbitKey
                        ? "color-mix(in srgb, var(--violet) 45%, transparent)"
                        : "var(--surface-border)",
                    background:
                      orbitKey === o.orbitKey
                        ? "var(--violet-soft)"
                        : "var(--surface)",
                  }}
                >
                  <p className="text-sm font-semibold">{o.title}</p>
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    {o.shortDescription}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {selectedOrbit ? (
            <TransitionLink
              href={`/orbits/${selectedOrbit.orbitKey}`}
              variant="fade"
              className="mt-2 inline-block text-xs font-semibold text-[var(--violet)]"
            >
              Preview Orbit →
            </TransitionLink>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="purpose"
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Why are you recommending this?
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value.slice(0, PURPOSE_MAX_LENGTH))}
          rows={2}
          maxLength={PURPOSE_MAX_LENGTH}
          placeholder="Practicing how to set a clear boundary."
          className="mt-2 w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-sm outline-none focus-visible:border-[var(--violet)]"
          style={{ borderColor: "var(--surface-border)" }}
        />
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          {purpose.length}/{PURPOSE_MAX_LENGTH}
        </p>
      </div>

      <div>
        <label
          htmlFor="note"
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          Add a note <span className="font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          value={personalMessage}
          onChange={(e) =>
            setPersonalMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))
          }
          rows={3}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="You mentioned this when we talked…"
          className="mt-2 w-full rounded-2xl border-2 bg-[var(--surface)] px-4 py-3 text-sm outline-none focus-visible:border-[var(--violet)]"
          style={{ borderColor: "var(--surface-border)" }}
        />
        <p className="mt-1 text-xs text-[var(--foreground-muted)]">
          {personalMessage.length}/{MESSAGE_MAX_LENGTH}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={
          !recipientUserId ||
          !orbitKey ||
          !purpose.trim() ||
          purpose.trim().length > PURPOSE_MAX_LENGTH
        }
        onClick={() => {
          setError(null);
          setStep("confirm");
        }}
        className="inline-flex w-full justify-center rounded-full bg-[var(--violet)] px-5 py-3.5 text-sm font-semibold text-[var(--on-violet)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Review recommendation
      </button>

      {sent.length > 0 ? (
        <section className="border-t pt-6" style={{ borderColor: "var(--hairline)" }}>
          <h2
            className="font-[family-name:var(--font-fraunces)] text-lg"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            }}
          >
            Recently sent
          </h2>
          <ul className="mt-3 space-y-3">
            {sent.slice(0, 8).map((item) => {
              const orbit = getOrbitByKey(item.orbitKey);
              const date = new Date(item.createdAt);
              return (
                <li
                  key={item.id}
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: "var(--surface-border)",
                    background: "var(--surface)",
                  }}
                >
                  <p className="font-semibold">
                    {formatUsernameDisplay(item.recipientUsername ?? "user")}
                  </p>
                  <p className="mt-0.5 text-[var(--foreground)]">
                    {orbit?.title ?? item.orbitKey}
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                    Sent{" "}
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
