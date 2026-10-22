"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Mic,
  Play,
  Square,
  Turtle,
} from "lucide-react";
import { toast } from "sonner";

import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import type { Word } from "@/features/curriculum/types";
import { bestMatch, type HeardResult } from "@/lib/pronunciation";
import {
  isRecognitionSupported,
  listenArabic,
  type Listener,
} from "@/lib/recognition";
import type { Rating } from "@/lib/srs";
import { speakArabic } from "@/lib/speech";
import { cn } from "@/lib/utils";

const MAX_RECORDING_MS = 6000;

const RATINGS: readonly { label: string; rating: Rating; className: string }[] =
  [
    { label: "Again", rating: 0, className: "text-red-600 dark:text-red-400" },
    {
      label: "Hard",
      rating: 3,
      className: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Good",
      rating: 4,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    { label: "Easy", rating: 5, className: "text-sky-600 dark:text-sky-400" },
  ];

type Phase = "idle" | "recording" | "checking" | "recorded";

interface SpeakingDrillProps {
  word: Word;
  onRate: (rating: Rating) => void;
  onSkip: () => void;
}

export function SpeakingDrill({ word, onRate, onSkip }: SpeakingDrillProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [result, setResult] = useState<HeardResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const listener = useRef<Listener | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef<string | null>(null);

  const releaseMic = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  useEffect(
    () => () => {
      releaseMic();
      listener.current?.stop();
      if (recorder.current && recorder.current.state !== "inactive") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [releaseMic],
  );

  async function startRecording() {
    setError(null);
    setResult(null);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setRecordingUrl(null);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Recording needs a secure connection (HTTPS or localhost).");
      return;
    }

    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const rec = new MediaRecorder(media);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = async () => {
        releaseMic();
        const url = URL.createObjectURL(
          new Blob(chunks, { type: rec.mimeType }),
        );
        urlRef.current = url;
        setRecordingUrl(url);
        setPhase("checking");
        const alternatives = (await listener.current?.result) ?? [];
        setResult(bestMatch(alternatives, word.ar));
        setPhase("recorded");
      };
      recorder.current = rec;
      listener.current = listenArabic();
      rec.start();
      setPhase("recording");
      timer.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch (e) {
      releaseMic();
      const denied = e instanceof DOMException && e.name === "NotAllowedError";
      setError(
        denied
          ? "Microphone access was blocked. Allow it in your browser's site settings and try again."
          : "No microphone could be started on this device.",
      );
      setPhase("idle");
    }
  }

  function stopRecording() {
    listener.current?.stop();
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop();
    }
  }

  async function playRecording() {
    if (!recordingUrl) return;
    try {
      await new Audio(recordingUrl).play();
    } catch {
      toast.error("Could not play your recording.");
    }
  }

  async function playModel() {
    try {
      await speakArabic(word.ar);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not play audio.");
    }
  }

  const recording = phase === "recording";
  const done = phase === "recorded";

  return (
    <div className="space-y-5">
      <div className="bg-card flex flex-col items-center gap-4 rounded-2xl border p-6 text-center shadow-sm">
        <ArabicText text={word.ar} size="xl" forceHarakat />
        <div className="space-y-0.5">
          <p className="text-muted-foreground">{word.tr}</p>
          <p className="text-xl font-semibold tracking-tight">{word.en}</p>
        </div>
        <div className="flex items-center gap-2">
          <SpeakButton text={word.ar} label="Hear the word" />
          <SpeakButton text={word.ar} slow label="Hear the word" size="icon" />
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Turtle className="size-3.5" aria-hidden />
            normal · slow
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          type="button"
          size="lg"
          variant={recording ? "destructive" : "default"}
          className="h-12 min-w-44 px-6"
          onClick={recording ? stopRecording : startRecording}
          disabled={phase === "checking"}
          aria-pressed={recording}
        >
          {recording ? <Square aria-hidden /> : <Mic aria-hidden />}
          {recording ? "Stop" : done ? "Record again" : "Record yourself"}
        </Button>
        <p aria-live="polite" className="text-muted-foreground min-h-5 text-xs">
          {recording
            ? "Listening… say the word clearly."
            : phase === "checking"
              ? "Checking…"
              : done
                ? ""
                : "Say it out loud, then compare with the model."}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-red-500"
            aria-hidden
          />
          {error}
        </div>
      )}

      {done && recordingUrl && (
        <div className="animate-in fade-in space-y-3 rounded-xl border p-4 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={playModel}>
              <Play aria-hidden /> Model
            </Button>
            <Button type="button" variant="outline" onClick={playRecording}>
              <Play aria-hidden /> You
            </Button>
          </div>
          <div aria-live="polite" className="text-sm">
            {!isRecognitionSupported() ? (
              <p className="text-muted-foreground">
                Your browser can’t check pronunciation. Compare the two by ear.
              </p>
            ) : result === null ? (
              <p className="text-muted-foreground">
                Couldn’t pick up clear Arabic. Compare by ear, or record again.
              </p>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {result.close ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" aria-hidden /> Sounds close
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Not quite the same.
                  </span>
                )}
                <span className="text-muted-foreground">Heard:</span>
                <ArabicText
                  text={result.heard}
                  size="sm"
                  forceHarakat={false}
                />
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              The browser’s recogniser often mishears learners, so you decide
              how it went. To check pronunciation, your browser may send the
              recording to its speech service.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "space-y-2 transition-opacity",
          !done && "pointer-events-none opacity-40",
        )}
        aria-hidden={!done}
      >
        <p className="text-muted-foreground text-center text-xs">
          How did that feel?
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <Button
              key={r.label}
              type="button"
              variant="outline"
              size="lg"
              disabled={!done}
              onClick={() => onRate(r.rating)}
              className={cn("h-12", r.className)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Skip this word
        </Button>
      </div>
    </div>
  );
}
