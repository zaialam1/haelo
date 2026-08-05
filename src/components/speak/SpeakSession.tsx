"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { getTopicById, DAILY_COMPLETED_KEY } from "@/lib/home/universe";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { pickReplacementQuestion } from "@/lib/questions/bank";
import type { BankQuestion } from "@/lib/questions/types";
import type { SpeakMode } from "@/lib/questions/sessions";
import { createClient } from "@/lib/supabase/client";
import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionLike,
} from "@/lib/speech/recognition";

type SpeakSessionProps = {
  mode: SpeakMode;
  questions: BankQuestion[];
  doneHref: string;
  planetLabel?: string;
};

type Phase = "ready" | "recording" | "done";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function extensionForMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) {
    return "mp4";
  }
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

export function SpeakSession({
  mode,
  questions,
  doneHref,
  planetLabel,
}: SpeakSessionProps) {
  const transition = useOptionalPageTransition();
  const [sessionQuestions, setSessionQuestions] = useState(questions);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const focusTimestampsRef = useRef<
    Array<{ questionId: string; startSeconds: number }>
  >([]);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`,
  );
  const timerRef = useRef<number | null>(null);
  const seenQuestionIdsRef = useRef(new Set(questions.map((q) => q.id)));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const keepRecognizingRef = useRef(false);

  const current = sessionQuestions[index]!;
  const topic = getTopicById(current.topicId);
  const voicePlanet = getVoicePlanetById(current.topicId);
  const placeLabel = planetLabel ?? topic?.label ?? voicePlanet?.label;
  const placeColor = topic?.color ?? voicePlanet?.color;
  const isFocus = mode === "focus";
  const isLast = index >= sessionQuestions.length - 1;
  const canSkip =
    mode !== "daily" && (phase === "ready" || (isFocus && phase === "recording"));

  useEffect(() => {
    return () => {
      stopTimer();
      stopSpeechRecognition();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopTimer() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetTranscriptBuffers() {
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
  }

  function currentTranscriptText(): string | null {
    const text = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 0 ? text : null;
  }

  function stopSpeechRecognition() {
    keepRecognizingRef.current = false;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
    }
  }

  function startSpeechRecognition() {
    stopSpeechRecognition();
    resetTranscriptBuffers();

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      interimTranscriptRef.current = interim.trim();
    };

    recognition.onerror = () => {
      // Network / no-speech / not-allowed — keep recording audio either way.
    };

    recognition.onend = () => {
      if (!keepRecognizingRef.current) return;
      try {
        recognition.start();
      } catch {
        /* already started or unavailable */
      }
    };

    recognitionRef.current = recognition;
    keepRecognizingRef.current = true;
    try {
      recognition.start();
    } catch {
      keepRecognizingRef.current = false;
      recognitionRef.current = null;
    }
  }

  function startTimer() {
    stopTimer();
    startedAtRef.current = Date.now();
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
  }

  async function ensureRecorder(): Promise<MediaRecorder> {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      return mediaRecorderRef.current;
    }
    if (!streamRef.current) {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }
    const recorder = new MediaRecorder(streamRef.current);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mediaRecorderRef.current = recorder;
    return recorder;
  }

  async function beginRecording() {
    setError(null);
    try {
      const recorder = await ensureRecorder();
      if (isFocus) {
        focusTimestampsRef.current = [
          { questionId: current.id, startSeconds: 0 },
        ];
        chunksRef.current = [];
        recorder.start(250);
        startSpeechRecognition();
        startTimer();
        setPhase("recording");
        return;
      }

      chunksRef.current = [];
      recorder.start(250);
      startSpeechRecognition();
      startTimer();
      setPhase("recording");
    } catch {
      setError("Microphone access is needed to record. Check browser permissions.");
    }
  }

  function skipQuestion() {
    if (!canSkip) return;
    setError(null);

    const replacement = pickReplacementQuestion(
      current.topicId,
      current.id,
      seenQuestionIdsRef.current,
    );
    if (!replacement) {
      setError("No other questions left in this topic right now.");
      return;
    }

    const previousId = current.id;
    seenQuestionIdsRef.current.add(replacement.id);

    if (isFocus && phase === "recording") {
      const stamps = focusTimestampsRef.current;
      const last = stamps[stamps.length - 1];
      if (last?.questionId === previousId) {
        last.questionId = replacement.id;
      }
    }

    setSessionQuestions((prev) => {
      const next = [...prev];
      next[index] = replacement;
      return next;
    });
  }

  function stopRecorderBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        resolve(blob);
      };
      recorder.stop();
    });
  }

  async function saveClip(opts: {
    question: BankQuestion;
    blob: Blob | null;
    durationSeconds: number;
    transcript?: string | null;
    questionIds?: string[];
    promptTexts?: string[];
    timestamps?: Array<{ questionId: string; startSeconds: number }>;
  }) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Sign in to save your recording.");
    }
    if (!opts.blob || opts.blob.size === 0) {
      throw new Error("No audio was captured. Try recording again.");
    }

    const contentType = opts.blob.type || "audio/webm";
    const ext = extensionForMime(contentType);
    const clipId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `clip-${Date.now()}`;
    const path = `${user.id}/${sessionIdRef.current}/${clipId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("reflections-audio")
      .upload(path, opts.blob, {
        contentType,
        upsert: false,
      });
    if (uploadError) {
      throw new Error(
        uploadError.message || "Could not upload this recording.",
      );
    }

    const row = {
      user_id: user.id,
      topic_id: opts.question.topicId,
      subtopic_id: null,
      prompt_text: opts.promptTexts?.join(" · ") ?? opts.question.text,
      question_id: opts.question.id,
      session_type: mode,
      session_id: sessionIdRef.current,
      question_ids: opts.questionIds ?? null,
      prompt_texts: opts.promptTexts ?? null,
      question_timestamps: opts.timestamps ?? null,
      duration_seconds: opts.durationSeconds,
      audio_url: path,
      transcript: opts.transcript ?? null,
    };

    const { error: insertError } = await supabase.from("reflections").insert(row);
    if (insertError) {
      await supabase.storage.from("reflections-audio").remove([path]);
      throw new Error(
        insertError.message || "Could not save this recording.",
      );
    }
  }

  async function finishCurrentQuestion() {
    setSaving(true);
    setError(null);
    try {
      if (isFocus) {
        if (!isLast) {
          const next = sessionQuestions[index + 1]!;
          const startSeconds = Math.floor(
            (Date.now() - startedAtRef.current) / 1000,
          );
          focusTimestampsRef.current.push({
            questionId: next.id,
            startSeconds,
          });
          setIndex((i) => i + 1);
          setSaving(false);
          return;
        }
        stopTimer();
        stopSpeechRecognition();
        const transcript = currentTranscriptText();
        const duration = Math.floor(
          (Date.now() - startedAtRef.current) / 1000,
        );
        const blob = await stopRecorderBlob();
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;

        await saveClip({
          question: sessionQuestions[0]!,
          blob,
          durationSeconds: duration,
          transcript,
          questionIds: sessionQuestions.map((q) => q.id),
          promptTexts: sessionQuestions.map((q) => q.text),
          timestamps: focusTimestampsRef.current,
        });
        setPhase("done");
        setSaving(false);
        return;
      }

      // main or daily — stop this clip
      stopTimer();
      stopSpeechRecognition();
      const transcript = currentTranscriptText();
      const duration = elapsed;
      const blob = await stopRecorderBlob();
      // Keep stream for next main question; stop tracks only at end
      if (isLast || mode === "daily") {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      } else {
        mediaRecorderRef.current = null;
      }

      await saveClip({
        question: current,
        blob,
        durationSeconds: duration,
        transcript,
      });

      if (mode === "daily") {
        try {
          localStorage.setItem(DAILY_COMPLETED_KEY, todayKey());
        } catch {
          /* ignore */
        }
      }

      if (isLast || mode === "daily") {
        setPhase("done");
      } else {
        setIndex((i) => i + 1);
        setElapsed(0);
        setPhase("ready");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this recording.");
    } finally {
      setSaving(false);
    }
  }

  function abandon() {
    stopTimer();
    stopSpeechRecognition();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (transition) {
      transition.navigate({ href: doneHref, variant: "fade" });
    } else {
      window.location.href = doneHref;
    }
  }

  if (phase === "done") {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          Session complete
        </p>
        <h1
          className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Nice work
        </h1>
        <p
          className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Your recording
          {mode === "main" ? "s are" : " is"} saved to{" "}
          {placeLabel ?? "your map"}.
        </p>
        <p
          className="mt-6 max-w-md text-xs leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Reflection details live on each planet&rsquo;s constellation timeline
          when you&rsquo;re ready to revisit them.
        </p>
        <TransitionLink
          href={doneHref}
          variant="fade"
          className="mt-10 inline-flex w-fit rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          {placeLabel ? `Back to ${placeLabel}` : "Back to universe"}
        </TransitionLink>
      </div>
    );
  }

  const modeLabel =
    planetLabel
      ? `${planetLabel} · ${index + 1} of ${sessionQuestions.length}`
      : mode === "main"
        ? `Question ${index + 1} of ${sessionQuestions.length}`
        : mode === "focus"
          ? `Focus · ${index + 1} of ${sessionQuestions.length}`
          : "Daily prompt";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--violet)" }}
        >
          {modeLabel}
        </p>
        <button
          type="button"
          onClick={abandon}
          className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          Exit
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8 sm:py-12">
        {placeLabel && placeColor && (
          <p
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: `color-mix(in srgb, ${placeColor} 28%, var(--surface))`,
              color: "var(--foreground)",
            }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: placeColor }}
              aria-hidden="true"
            />
            {placeLabel}
          </p>
        )}

        <h1
          className="mt-5 max-w-2xl font-[family-name:var(--font-fraunces)] text-3xl leading-snug sm:text-4xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          &ldquo;{current.text}&rdquo;
        </h1>

        <p
          className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed sm:text-base"
          style={{ color: "var(--foreground-muted)" }}
        >
          Take your time — most answers land under about 2 minutes 30 seconds.
          There&rsquo;s no hard timer.
        </p>

        {phase === "recording" && (
          <p
            className="mt-8 font-mono text-base tabular-nums"
            style={{ color: "var(--violet)" }}
            aria-live="polite"
          >
            {formatElapsed(elapsed)}
            {elapsed >= 150 ? " · soft limit" : ""}
          </p>
        )}

        {error && (
          <p
            className="mt-4 text-sm"
            style={{ color: "var(--rose-deep, #D478A0)" }}
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {phase === "ready" && (
          <button
            type="button"
            onClick={beginRecording}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start recording
          </button>
        )}

        {phase === "recording" && (
          <button
            type="button"
            onClick={finishCurrentQuestion}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "var(--gold)",
              color: "var(--on-warm)",
            }}
          >
            {saving
              ? "Saving…"
              : isFocus && !isLast
                ? "Next question"
                : isLast || mode === "daily"
                  ? "Finish"
                  : "Save & next"}
          </button>
        )}

        {canSkip && (
          <button
            type="button"
            onClick={skipQuestion}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "color-mix(in srgb, var(--violet) 10%, transparent)",
              color: "var(--foreground)",
            }}
          >
            Skip question
          </button>
        )}
      </div>
    </div>
  );
}
