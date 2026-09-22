"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MAX_RECORDING_SECONDS } from "@/config/recording";
import {
  baseAudioMimeType,
  isMediaRecorderSupported,
  isUsableRecordingBlob,
  pickSupportedMimeType,
} from "@/lib/sessions/audio";
import {
  getSpeechRecognitionCtor,
  type SpeechRecognitionLike,
} from "@/lib/speech/recognition";

export type RecorderStatus =
  | "idle"
  | "requesting_permission"
  | "countdown"
  | "recording"
  | "recorded"
  | "error";

export type RecorderErrorKind =
  | "permission_denied"
  | "no_microphone"
  | "unsupported"
  | "empty_recording"
  | "unknown";

export type RecorderError = {
  kind: RecorderErrorKind;
  message: string;
};

export type UseAudioRecorderOptions = {
  maxSeconds?: number;
  /** Subtle 3-2-1 before capture. Default true. */
  countdownSeconds?: number;
};

export type UseAudioRecorderResult = {
  status: RecorderStatus;
  error: RecorderError | null;
  elapsedSeconds: number;
  maxSeconds: number;
  remainingSeconds: number;
  blob: Blob | null;
  mimeType: string | null;
  objectUrl: string | null;
  countdownValue: number | null;
  /** Live / final transcript from Web Speech when the browser supports it. */
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  retake: () => void;
  clearError: () => void;
};

function mapGetUserMediaError(err: unknown): RecorderError {
  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      kind: "permission_denied",
      message:
        "Halo needs microphone access to record your response. You can enable microphone permission in your browser settings and try again.",
    };
  }

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    name === "OverconstrainedError"
  ) {
    return {
      kind: "no_microphone",
      message: "We couldn’t find a microphone on this device.",
    };
  }

  return {
    kind: "unknown",
    message:
      "Something went wrong starting the microphone. Please try again.",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * After OS/Chrome mic permission, the track can look live while still muted
 * and producing no samples. Starting MediaRecorder then writes a header-only
 * WebM that will not play or transcribe.
 */
async function waitForMicReady(stream: MediaStream): Promise<void> {
  const track = stream.getAudioTracks()[0];
  if (!track) return;
  track.enabled = true;

  if (track.muted || track.readyState !== "live") {
    await Promise.race([
      new Promise<void>((resolve) => {
        const finish = () => {
          track.removeEventListener("unmute", finish);
          resolve();
        };
        track.addEventListener("unmute", finish);
        if (!track.muted && track.readyState === "live") finish();
      }),
      sleep(1500),
    ]);
  }

  await sleep(400);
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {},
): UseAudioRecorderResult {
  const maxSeconds = options.maxSeconds ?? DEFAULT_MAX_RECORDING_SECONDS;
  const countdownSeconds = options.countdownSeconds ?? 3;

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const maxSecondsRef = useRef(maxSeconds);
  const stoppingRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const startGenerationRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");
  const keepRecognitionAliveRef = useRef(false);

  useEffect(() => {
    maxSecondsRef.current = maxSeconds;
  }, [maxSeconds]);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setObjectUrl(null);
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    keepRecognitionAliveRef.current = false;
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
  }, []);

  const publishTranscript = useCallback(() => {
    const text = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`
      .replace(/\s+/g, " ")
      .trim();
    setTranscript(text);
  }, []);

  const startSpeechRecognition = useCallback(() => {
    stopSpeechRecognition();
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setTranscript("");

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
          finalTranscriptRef.current =
            `${finalTranscriptRef.current} ${piece}`.trim();
        } else {
          interim += piece;
        }
      }
      interimTranscriptRef.current = interim.trim();
      publishTranscript();
    };

    recognition.onerror = () => {
      // Optional capability — recording still works without it.
    };

    recognition.onend = () => {
      if (!keepRecognitionAliveRef.current || !recognitionRef.current) return;
      try {
        recognition.start();
      } catch {
        /* ignore restart failures */
      }
    };

    recognitionRef.current = recognition;
    keepRecognitionAliveRef.current = true;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      keepRecognitionAliveRef.current = false;
    }
  }, [publishTranscript, stopSpeechRecognition]);

  const clearTimers = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const cleanupRecorder = useCallback(() => {
    clearTimers();
    stopSpeechRecognition();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    stopTracks();
    chunksRef.current = [];
    stoppingRef.current = false;
  }, [clearTimers, stopSpeechRecognition, stopTracks]);

  useEffect(() => {
    return () => {
      cleanupRecorder();
      revokeObjectUrl();
    };
  }, [cleanupRecorder, revokeObjectUrl]);

  const finishWithBlob = useCallback(
    (recorded: Blob, type: string) => {
      stopSpeechRecognition();
      publishTranscript();
      stopTracks();
      mediaRecorderRef.current = null;
      clearTimers();

      const containerType = baseAudioMimeType(type);
      const playable =
        recorded.type === containerType
          ? recorded
          : new Blob([recorded], { type: containerType });

      if (!isUsableRecordingBlob(playable)) {
        setBlob(null);
        setMimeType(null);
        revokeObjectUrl();
        setError({
          kind: "empty_recording",
          message:
            "We couldn’t capture any audio. Check your microphone and try again.",
        });
        setStatus("error");
        return;
      }

      revokeObjectUrl();
      const url = URL.createObjectURL(playable);
      objectUrlRef.current = url;
      setObjectUrl(url);
      setBlob(playable);
      setMimeType(containerType);
      setStatus("recorded");
    },
    [
      clearTimers,
      publishTranscript,
      revokeObjectUrl,
      stopSpeechRecognition,
      stopTracks,
    ],
  );

  const stopRecordingInternal = useCallback(() => {
    if (stoppingRef.current) return;
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    stoppingRef.current = true;
    keepRecognitionAliveRef.current = false;
    clearTimers();
    setCountdownValue(null);

    recorder.onstop = () => {
      const type =
        recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
      const recorded = new Blob(chunksRef.current, {
        type: baseAudioMimeType(type),
      });
      chunksRef.current = [];
      stoppingRef.current = false;
      finishWithBlob(recorded, type);
    };

    try {
      if (typeof recorder.requestData === "function" && recorder.state === "recording") {
        recorder.requestData();
      }
      recorder.stop();
    } catch {
      stoppingRef.current = false;
      stopTracks();
      setError({
        kind: "unknown",
        message: "Could not stop the recording. Please try again.",
      });
      setStatus("error");
    }
  }, [clearTimers, finishWithBlob, stopTracks]);

  const startRecorderFromOpenStream = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) {
      setError({
        kind: "unknown",
        message:
          "Something went wrong starting the microphone. Please try again.",
      });
      setStatus("error");
      return;
    }

    const preferred = pickSupportedMimeType();
    const recorder =
      preferred === null
        ? null
        : preferred
          ? new MediaRecorder(stream, { mimeType: preferred })
          : new MediaRecorder(stream);

    if (!recorder) {
      stopTracks();
      setError({
        kind: "unsupported",
        message:
          "This browser doesn’t support audio recording. Try Chrome, Safari, Edge, or Firefox on a recent version.",
      });
      setStatus("error");
      return;
    }

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onerror = () => {
      cleanupRecorder();
      setError({
        kind: "unknown",
        message: "Recording failed unexpectedly. Please try again.",
      });
      setStatus("error");
    };

    mediaRecorderRef.current = recorder;
    const mime = recorder.mimeType || preferred || "";
    // Timeslice WebM is often unplayable. Safari/mp4 still needs a timeslice
    // or stop() can flush an empty blob.
    if (mime.toLowerCase().includes("webm") || mime.toLowerCase().includes("ogg")) {
      recorder.start();
    } else {
      recorder.start(1000);
    }
    startedAtRef.current = Date.now();
    setStatus("recording");
    setElapsedSeconds(0);
    startSpeechRecognition();

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed >= maxSecondsRef.current) {
        stopRecordingInternal();
      }
    }, 200);
  }, [cleanupRecorder, startSpeechRecognition, stopRecordingInternal, stopTracks]);

  const startRecording = useCallback(async () => {
    startGenerationRef.current += 1;
    const generation = startGenerationRef.current;
    cleanupRecorder();
    revokeObjectUrl();
    setBlob(null);
    setMimeType(null);
    setElapsedSeconds(0);
    setTranscript("");
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setError(null);
    setCountdownValue(null);

    if (!isMediaRecorderSupported()) {
      setError({
        kind: "unsupported",
        message:
          "This browser doesn’t support audio recording. Try Chrome, Safari, Edge, or Firefox on a recent version.",
      });
      setStatus("error");
      return;
    }

    setStatus("requesting_permission");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (generation !== startGenerationRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      await waitForMicReady(stream);
      if (generation !== startGenerationRef.current) {
        stopTracks();
        return;
      }

      if (countdownSeconds <= 0) {
        startRecorderFromOpenStream();
        return;
      }

      setStatus("countdown");
      let remaining = countdownSeconds;
      setCountdownValue(remaining);

      countdownTimerRef.current = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownTimerRef.current != null) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setCountdownValue(null);
          if (generation !== startGenerationRef.current) return;
          startRecorderFromOpenStream();
          return;
        }
        setCountdownValue(remaining);
      }, 1000);
    } catch (err) {
      if (generation !== startGenerationRef.current) return;
      stopTracks();
      setError(mapGetUserMediaError(err));
      setStatus("error");
    }
  }, [
    cleanupRecorder,
    countdownSeconds,
    revokeObjectUrl,
    startRecorderFromOpenStream,
  ]);

  const stopRecording = useCallback(() => {
    if (status === "countdown" || status === "requesting_permission") {
      startGenerationRef.current += 1;
      clearTimers();
      stopTracks();
      setCountdownValue(null);
      setStatus("idle");
      return;
    }
    stopRecordingInternal();
  }, [clearTimers, status, stopRecordingInternal, stopTracks]);

  const retake = useCallback(() => {
    startGenerationRef.current += 1;
    cleanupRecorder();
    revokeObjectUrl();
    setBlob(null);
    setMimeType(null);
    setElapsedSeconds(0);
    setTranscript("");
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    setError(null);
    setCountdownValue(null);
    setStatus("idle");
  }, [cleanupRecorder, revokeObjectUrl]);

  const clearError = useCallback(() => {
    setError(null);
    if (status === "error") setStatus("idle");
  }, [status]);

  return {
    status,
    error,
    elapsedSeconds,
    maxSeconds,
    remainingSeconds: Math.max(0, maxSeconds - elapsedSeconds),
    blob,
    mimeType,
    objectUrl,
    countdownValue,
    transcript,
    startRecording,
    stopRecording,
    retake,
    clearError,
  };
}
