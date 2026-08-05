"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { planetAccent } from "@/lib/journey/mapSession";
import type { JourneyNode, JourneySession } from "@/lib/journey/types";

type JourneySessionPanelProps = {
  session: JourneySession | JourneyNode | null;
  open: boolean;
  onClose: () => void;
};

function formatPanelDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function AudioPlayButton({
  audioUrl,
  label,
}: {
  audioUrl: string;
  label: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setLoading(true);
      if (!audio.src || audio.dataset.path !== audioUrl) {
        const supabase = createClient();
        const { data, error: signedError } = await supabase.storage
          .from("reflections-audio")
          .createSignedUrl(audioUrl, 3600);
        if (signedError || !data?.signedUrl) {
          throw new Error(signedError?.message || "Could not load this recording.");
        }
        audio.src = data.signedUrl;
        audio.dataset.path = audioUrl;
      }
      await audio.play();
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
      setError(e instanceof Error ? e.message : "Could not play this recording.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        className="sr-only"
      />
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        style={{
          background: "color-mix(in srgb, var(--violet) 12%, transparent)",
          color: "var(--foreground)",
        }}
      >
        <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
        {loading ? "Loading…" : playing ? "Pause" : label}
      </button>
      {error ? (
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--rose-deep, #D478A0)" }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-7">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function JourneySessionPanel({
  session,
  open,
  onClose,
}: JourneySessionPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open, session?.sessionId]);

  const first = session?.clips[0] ?? null;
  const second = session?.clips[1] ?? null;
  const accent = session ? planetAccent(session.planet) : "var(--violet)";

  return (
    <>
      <div
        className="journey-panel-backdrop fixed inset-0 z-40 bg-black/25"
        data-open={open}
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="journey-session-panel fixed z-50 flex flex-col overflow-y-auto outline-none"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
        }}
        data-open={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        role="dialog"
        aria-modal="true"
      >
        {session ? (
          <div key={session.sessionId} className="flex flex-1 flex-col px-6 py-6 sm:px-7">
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p
                  id={titleId}
                  className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: accent }}
                >
                  {session.planetLabel}
                  <span
                    className="mx-2 font-normal opacity-40"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <span style={{ color: "var(--foreground-muted)" }}>
                    {formatPanelDate(session.recordedAt)}
                  </span>
                </p>
                {session.sessionType === "daily" ? (
                  <p
                    className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.08em] uppercase"
                    style={{
                      background:
                        "color-mix(in srgb, var(--gold) 40%, var(--surface))",
                      color: "var(--violet)",
                    }}
                  >
                    Daily prompt
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{ color: "var(--foreground-muted)" }}
                aria-label="Close session details"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Prompt
              </p>
              <p
                className="mt-2 font-[family-name:var(--font-fraunces)] text-xl leading-snug"
                style={{
                  fontVariationSettings:
                    '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
                  color: "var(--foreground)",
                }}
              >
                &ldquo;{session.prompt}&rdquo;
              </p>
            </div>

            {first ? (
              <PanelSection title="Your response">
                {first.audioUrl ? (
                  <AudioPlayButton
                    key={first.audioUrl}
                    audioUrl={first.audioUrl}
                    label="Play recording"
                  />
                ) : null}
                {first.transcript?.trim() ? (
                  <p
                    className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {first.transcript.trim()}
                  </p>
                ) : !first.audioUrl ? (
                  <p
                    className="text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    No recording was saved for this response.
                  </p>
                ) : null}
              </PanelSection>
            ) : null}

            {session.userReflection?.trim() ? (
              <PanelSection title="Your reflection">
                <p
                  className="text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--foreground)" }}
                >
                  {session.userReflection.trim()}
                </p>
              </PanelSection>
            ) : null}

            {session.attuneObservation?.trim() ||
            session.voiceNotes.length > 0 ? (
              <PanelSection title="What Attune noticed">
                {session.attuneObservation?.trim() ? (
                  <p
                    className="text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {session.attuneObservation.trim()}
                  </p>
                ) : null}
                {session.voiceNotes.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {session.voiceNotes.map((note) => (
                      <li
                        key={note}
                        className="text-[0.9375rem] leading-relaxed"
                        style={{ color: "var(--foreground)" }}
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </PanelSection>
            ) : null}

            {second ? (
              <PanelSection title="Try again">
                {second.promptText !== session.prompt ? (
                  <p
                    className="mb-2 text-sm leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    &ldquo;{second.promptText}&rdquo;
                  </p>
                ) : null}
                {second.audioUrl ? (
                  <AudioPlayButton
                    key={second.audioUrl}
                    audioUrl={second.audioUrl}
                    label="Play second recording"
                  />
                ) : null}
                {second.transcript?.trim() ? (
                  <p
                    className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {second.transcript.trim()}
                  </p>
                ) : null}
              </PanelSection>
            ) : null}

            {session.changeObservation?.trim() ? (
              <PanelSection title="What changed">
                <p
                  className="text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--foreground)" }}
                >
                  {session.changeObservation.trim()}
                </p>
              </PanelSection>
            ) : null}

            <div
              className="mt-auto pt-10"
              style={{ borderTop: "1px solid var(--hairline)" }}
            >
              <span
                className="inline-block size-3.5 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 14px color-mix(in srgb, ${accent} 60%, transparent)`,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
