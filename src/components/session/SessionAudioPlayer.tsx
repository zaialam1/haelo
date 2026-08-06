"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { getSessionAudioUrl } from "@/lib/sessions/audio";

export type SessionAudioPlayerProps = {
  /** Private storage path — signed on demand. Omit when using src. */
  storagePath?: string | null;
  /** Direct playable URL (blob: or signed). */
  src?: string | null;
  label?: string;
  accentColor?: string;
  className?: string;
  /** Known duration from DB; refined when metadata loads. */
  durationHintSeconds?: number | null;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function usableDuration(audioDuration: number, fallback: number): number {
  if (Number.isFinite(audioDuration) && audioDuration > 0) return audioDuration;
  if (Number.isFinite(fallback) && fallback > 0) return fallback;
  return 0;
}

export function SessionAudioPlayer({
  storagePath,
  src,
  label = "Recording",
  accentColor = "var(--violet)",
  className,
  durationHintSeconds,
}: SessionAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const labelId = useId();
  const sliderId = useId();

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    typeof durationHintSeconds === "number" && durationHintSeconds > 0
      ? durationHintSeconds
      : 0,
  );
  const [signedSrc, setSignedSrc] = useState<string | null>(null);

  const hint =
    typeof durationHintSeconds === "number" && durationHintSeconds > 0
      ? durationHintSeconds
      : 0;
  const displayDuration = usableDuration(duration, hint);
  const resolvedSrc = src ?? signedSrc;

  useEffect(() => {
    if (src || !storagePath) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const url = await getSessionAudioUrl(storagePath);
        if (!cancelled) {
          setSignedSrc(url);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load this recording.",
          );
          setSignedSrc(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storagePath, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedSrc) return;
    audio.src = resolvedSrc;
    audio.load();
  }, [resolvedSrc]);

  const syncDurationFromAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  }, []);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const total = usableDuration(audio.duration, displayDuration);
      if (total <= 0) return;

      const clamped = Math.min(1, Math.max(0, ratio));
      const next = clamped * total;

      try {
        audio.currentTime = next;
      } catch {
        return;
      }
      setCurrentTime(next);
    },
    [displayDuration],
  );

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      seekToRatio((clientX - rect.left) / rect.width);
    },
    [seekToRatio],
  );

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !resolvedSrc) return;
    setError(null);

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setLoading(true);
      syncDurationFromAudio();
      await audio.play();
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
      setError(e instanceof Error ? e.message : "Could not play this recording.");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
    } catch {
      return;
    }
    setCurrentTime(0);
  }

  function onTrackPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (displayDuration <= 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    seekFromClientX(e.clientX);
  }

  function onTrackPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    e.preventDefault();
    seekFromClientX(e.clientX);
  }

  function onTrackPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function onSliderKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (displayDuration <= 0) return;

    const step = e.shiftKey ? 5 : 2;
    let handled = true;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      seekToRatio(Math.max(0, currentTime - step) / displayDuration);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      seekToRatio(Math.min(displayDuration, currentTime + step) / displayDuration);
    } else if (e.key === "Home") {
      seekToRatio(0);
    } else if (e.key === "End") {
      seekToRatio(1);
    } else {
      handled = false;
    }

    if (handled) e.preventDefault();
  }

  const progress =
    displayDuration > 0
      ? Math.min(1, Math.max(0, currentTime / displayDuration))
      : 0;

  if (!storagePath && !src) {
    return (
      <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
        No recording available.
      </p>
    );
  }

  return (
    <div className={className}>
      <audio
        ref={audioRef}
        preload="auto"
        onLoadedMetadata={syncDurationFromAudio}
        onDurationChange={syncDurationFromAudio}
        onCanPlay={syncDurationFromAudio}
        onTimeUpdate={(e) => {
          if (!draggingRef.current) {
            setCurrentTime(e.currentTarget.currentTime);
          }
          syncDurationFromAudio();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(displayDuration || 0);
        }}
        onError={() => {
          setError("Could not play this recording.");
          setPlaying(false);
        }}
        className="sr-only"
        aria-labelledby={labelId}
      />

      <p id={labelId} className="sr-only">
        {label}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void togglePlay()}
          disabled={loading || !resolvedSrc || Boolean(error)}
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background: `color-mix(in srgb, ${accentColor} 22%, var(--surface))`,
            color: "var(--foreground)",
          }}
        >
          <span aria-hidden="true" className="text-base leading-none">
            {playing ? "❚❚" : "▶"}
          </span>
          <span className="ml-2">{playing ? "Pause" : "Play"}</span>
        </button>

        <button
          type="button"
          onClick={restart}
          disabled={!resolvedSrc}
          aria-label={`Restart ${label}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          Restart
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span
          className="w-10 shrink-0 font-mono text-xs tabular-nums"
          style={{ color: "var(--foreground-muted)" }}
          aria-hidden="true"
        >
          {formatTime(currentTime)}
        </span>

        <div
          ref={trackRef}
          id={sliderId}
          role="slider"
          tabIndex={0}
          aria-label={`${label} playback position`}
          aria-valuemin={0}
          aria-valuemax={Math.round(displayDuration) || 0}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(displayDuration)}`}
          onKeyDown={onSliderKeyDown}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
          className="relative h-12 flex-1 cursor-pointer touch-none select-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          <div
            className="pointer-events-none absolute inset-y-[1.25rem] left-0 right-0 rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--foreground) 12%, transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-[1.25rem] left-0 rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: accentColor,
            }}
          />
          <div
            className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
            style={{
              left: `${progress * 100}%`,
              background: "var(--surface)",
              border: `2px solid ${accentColor}`,
            }}
            aria-hidden="true"
          />
        </div>

        <span
          className="w-10 shrink-0 text-right font-mono text-xs tabular-nums"
          style={{ color: "var(--foreground-muted)" }}
          aria-hidden="true"
        >
          {formatTime(displayDuration)}
        </span>
      </div>

      {loading && !resolvedSrc ? (
        <p
          className="mt-2 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Loading audio…
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--rose-deep, #D478A0)" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
