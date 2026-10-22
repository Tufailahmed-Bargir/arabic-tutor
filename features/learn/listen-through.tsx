"use client";

import { useRef, useState } from "react";
import { Headphones, Loader2, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Word } from "@/features/curriculum/types";
import { speakEnglish, stopEnglish } from "@/lib/english-speech";
import { speakArabic } from "@/lib/speech";

const PAUSE_MS = 500;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Plays each word in Arabic, then its English meaning (Kokoro, in the browser). */
export function ListenThrough({ words }: { words: readonly Word[] }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [download, setDownload] = useState<number | null>(null);
  const cancelled = useRef(false);

  async function start() {
    cancelled.current = false;
    setState("loading");
    try {
      for (const word of words) {
        if (cancelled.current) break;
        await speakArabic(word.ar);
        if (cancelled.current) break;
        await wait(PAUSE_MS);
        await speakEnglish(word.en, (percent) => setDownload(percent));
        setState("playing");
        setDownload(null);
        await wait(PAUSE_MS * 2);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not play the lesson.",
      );
    } finally {
      setDownload(null);
      setState("idle");
    }
  }

  function stop() {
    cancelled.current = true;
    stopEnglish();
  }

  const busy = state !== "idle";

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={busy ? stop : start}
        aria-live="polite"
      >
        {state === "loading" ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : busy ? (
          <Square aria-hidden />
        ) : (
          <Headphones aria-hidden />
        )}
        {busy ? "Stop" : "Listen through"}
      </Button>
      {download !== null && (
        <div className="space-y-1">
          <Progress value={download} aria-label="Downloading English voice" />
          <p className="text-muted-foreground text-xs">
            Downloading the English voice once (about 90 MB), then it works
            offline from your browser cache.
          </p>
        </div>
      )}
    </div>
  );
}
