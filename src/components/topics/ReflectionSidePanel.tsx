"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TimelineNode } from "@/lib/topics/types";

type ReflectionSidePanelProps = {
  node: TimelineNode | null;
  open: boolean;
  onClose: () => void;
};

type PanelMode = "audio" | "transcript";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function ReflectionSidePanel({
  node,
  open,
  onClose,
}: ReflectionSidePanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<PanelMode>("audio");
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setMode("audio");
    setPlaying(false);
    setLoadingAudio(false);
    setAudioError(null);
  }, [node?.id]);

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [open]);

  async function togglePlayback() {
    if (!node?.audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setLoadingAudio(true);
      if (!audio.src || audio.dataset.path !== node.audioUrl) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("reflections-audio")
          .createSignedUrl(node.audioUrl, 3600);
        if (error || !data?.signedUrl) {
          throw new Error(error?.message || "Could not load this recording.");
        }
        audio.src = data.signedUrl;
        audio.dataset.path = node.audioUrl;
      }
      await audio.play();
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
      setAudioError(
        e instanceof Error ? e.message : "Could not play this recording.",
      );
    } finally {
      setLoadingAudio(false);
    }
  }

  const hasAudio = Boolean(node?.audioUrl);
  const transcript = node?.transcript?.trim() ?? "";
  const hasTranscript = transcript.length > 0;

  return (
    <>
      <div
        className="planet-panel-backdrop fixed inset-0 z-40 bg-black/25"
        data-open={open}
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className="planet-side-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto"
        style={{
          background: "var(--surface)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid var(--surface-border)",
          boxShadow: open
            ? "-18px 0 48px rgba(51, 51, 51, 0.14)"
            : "none",
        }}
        aria-hidden={!open}
        aria-label="Reflection details"
      >
        {node && (
          <div
            key={node.id}
            className="flex flex-1 flex-col px-6 py-6 sm:px-7"
          >
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
                  style={{ color: "var(--violet)" }}
                >
                  {formatDate(node.recordedAt)}
                </p>
                {node.isDaily && (
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
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2.5 py-1 text-sm font-medium transition-all duration-200 hover:bg-[var(--violet-soft)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{ color: "var(--foreground-muted)" }}
                aria-label="Close panel"
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
                &ldquo;{node.promptText}&rdquo;
              </p>
            </div>

            <div
              className="mt-6 inline-flex rounded-full p-1"
              style={{
                background:
                  "color-mix(in srgb, var(--violet) 8%, transparent)",
              }}
              role="tablist"
              aria-label="Listen or read"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "audio"}
                onClick={() => setMode("audio")}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background:
                    mode === "audio" ? "var(--surface)" : "transparent",
                  color: "var(--foreground)",
                  boxShadow:
                    mode === "audio"
                      ? "0 1px 4px rgba(51, 51, 51, 0.08)"
                      : "none",
                }}
              >
                Play
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "transcript"}
                onClick={() => {
                  audioRef.current?.pause();
                  setPlaying(false);
                  setMode("transcript");
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background:
                    mode === "transcript" ? "var(--surface)" : "transparent",
                  color: "var(--foreground)",
                  boxShadow:
                    mode === "transcript"
                      ? "0 1px 4px rgba(51, 51, 51, 0.08)"
                      : "none",
                }}
              >
                Transcript
              </button>
            </div>

            <audio
              ref={audioRef}
              preload="none"
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              className="sr-only"
            />

            {mode === "audio" ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={togglePlayback}
                  disabled={!hasAudio || loadingAudio}
                  className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--violet) 12%, transparent)",
                    color: "var(--foreground)",
                  }}
                  title={hasAudio ? undefined : "No audio for this reflection"}
                >
                  <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
                  {loadingAudio
                    ? "Loading…"
                    : playing
                      ? "Pause"
                      : hasAudio
                        ? "Play recording"
                        : "No audio"}
                </button>
                {audioError && (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: "var(--rose-deep, #D478A0)" }}
                  >
                    {audioError}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <p
                  className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Your words
                </p>
                {hasTranscript ? (
                  <p
                    className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground)" }}
                  >
                    {transcript}
                  </p>
                ) : (
                  <p
                    className="mt-2 text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    A transcript wasn&rsquo;t captured for this reflection.
                    New recordings will save one when speech recognition is
                    available in your browser.
                  </p>
                )}
              </div>
            )}

            <div className="mt-8">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                What stood out
              </p>
              <p
                className="mt-2 text-[0.9375rem] leading-relaxed"
                style={{
                  color: node.stoodOut
                    ? "var(--foreground)"
                    : "var(--foreground-muted)",
                }}
              >
                {node.stoodOut ??
                  "Insights will appear after your first few reflections."}
              </p>
            </div>

            <div className="mt-6">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Your voice
              </p>
              {node.voiceNotes.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {node.voiceNotes.map((note) => (
                    <li
                      key={note}
                      className="text-[0.9375rem] leading-relaxed"
                      style={{ color: "var(--foreground)" }}
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  className="mt-2 text-[0.9375rem] leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Voice patterns will show here once this reflection is analyzed.
                </p>
              )}
            </div>

            <div className="mt-6">
              <p
                className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
                style={{ color: "var(--foreground-muted)" }}
              >
                Theme
              </p>
              <p
                className="mt-2 text-[0.9375rem]"
                style={{
                  color: node.themeLabel
                    ? "var(--foreground)"
                    : "var(--foreground-muted)",
                }}
              >
                {node.themeLabel ?? "Theme will appear when tagged."}
              </p>
            </div>

            <div
              className="mt-auto pt-10"
              style={{
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <span
                className="inline-block size-3.5 rounded-full"
                style={{
                  background: node.tint,
                  boxShadow: `0 0 14px color-mix(in srgb, ${node.tint} 60%, transparent)`,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
