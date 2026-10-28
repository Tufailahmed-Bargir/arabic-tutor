"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { streamArabic, type ArabicStream } from "@/lib/recognition";
import {
  applyFinal,
  createSession,
  expectedForms,
  finishSession,
  isFinished,
  previewInterim,
  type HifzSession,
} from "./session";
import type { QuranWord } from "./types";

export type RecitationStatus = "idle" | "starting" | "listening" | "done";

const MISTAKE_BUZZ_MS = 35;

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Microphone access was blocked. Allow it in your browser's site settings and try again.",
  "service-not-allowed":
    "Your browser's speech service is turned off. Enable it, or try Chrome or Edge.",
  "audio-capture": "No microphone could be started on this device.",
  network:
    "Speech recognition needs an internet connection in this browser. Check your connection and try again.",
  "language-not-supported":
    "Your browser's speech service doesn't support Arabic. Try Chrome or Edge.",
};
const FALLBACK_ERROR = "Listening stopped unexpectedly. Try again.";

async function ensureMicrophone(): Promise<string | null> {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return "Recording needs a secure connection (HTTPS or localhost).";
  }
  try {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    media.getTracks().forEach((t) => t.stop());
    return null;
  } catch (e) {
    const denied = e instanceof DOMException && e.name === "NotAllowedError";
    return denied
      ? (ERROR_MESSAGES["not-allowed"] ?? FALLBACK_ERROR)
      : (ERROR_MESSAGES["audio-capture"] ?? FALLBACK_ERROR);
  }
}

interface RecitationOptions {
  words: readonly QuranWord[];
  /** Called once with the settled session when recitation ends. */
  onComplete: (session: HifzSession) => void;
  onError: (message: string) => void;
}

export function useRecitation({
  words,
  onComplete,
  onError,
}: RecitationOptions) {
  const forms = useMemo(() => expectedForms(words), [words]);
  const [session, setSession] = useState(() => createSession(words.length));
  const [interim, setInterim] = useState<number[]>([]);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<RecitationStatus>("idle");

  const sessionRef = useRef(session);
  const streamRef = useRef<ArabicStream | null>(null);
  const finishingRef = useRef(false);
  const callbacks = useRef({ onComplete, onError });
  useEffect(() => {
    callbacks.current = { onComplete, onError };
  });

  const update = useCallback((next: HifzSession) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const stream = streamRef.current;
    streamRef.current = null;
    await stream?.stop();
    const settled = finishSession(sessionRef.current, forms);
    update(settled);
    setInterim([]);
    setStatus("done");
    callbacks.current.onComplete(settled);
  }, [forms, update]);

  const start = useCallback(async () => {
    setStatus("starting");
    const micError = await ensureMicrophone();
    if (micError) {
      setStatus("idle");
      callbacks.current.onError(micError);
      return;
    }

    finishingRef.current = false;
    update(createSession(words.length));
    setInterim([]);
    setHeard("");

    const stream = streamArabic({
      onFinal(text) {
        setHeard(text);
        const { session: next, newMistakes } = applyFinal(
          sessionRef.current,
          forms,
          text,
        );
        update(next);
        setInterim([]);
        if (newMistakes > 0) navigator.vibrate?.(MISTAKE_BUZZ_MS);
        if (isFinished(next)) void finish();
      },
      onInterim(text) {
        if (text) setHeard(text);
        setInterim(text ? previewInterim(sessionRef.current, forms, text) : []);
      },
      onError(error) {
        streamRef.current = null;
        callbacks.current.onError(ERROR_MESSAGES[error] ?? FALLBACK_ERROR);
        // Keep what was already recited: show its summary rather than discarding it.
        if (sessionRef.current.cursor > 0) {
          void finish();
        } else {
          setStatus("idle");
          setInterim([]);
        }
      },
    });
    if (!stream) {
      setStatus("idle");
      callbacks.current.onError(
        "Your browser can't recognise speech. Use Chrome, Edge or Safari.",
      );
      return;
    }
    streamRef.current = stream;
    setStatus("listening");
  }, [finish, forms, update, words.length]);

  // Release the microphone when the passage changes or the page closes.
  useEffect(
    () => () => {
      finishingRef.current = true;
      void streamRef.current?.stop();
      streamRef.current = null;
    },
    [words],
  );

  return { session, interim, heard, status, start, stop: finish };
}
