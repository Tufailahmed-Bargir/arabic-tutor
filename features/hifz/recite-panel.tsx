"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, LoaderCircle, Mic, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { progressActions } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";
import { MushafView } from "./mushaf-view";
import { getSurah } from "./quran";
import { summarize, type HifzSession, type HifzSummary } from "./session";
import { Summary } from "./summary";
import type { Passage } from "./setup-form";
import type { QuranWord } from "./types";
import { useRecitation } from "./use-recitation";

interface RecitePanelProps {
  passage: Passage;
  words: readonly QuranWord[];
  onRetry: (passage: Passage) => void;
  onChangePassage: () => void;
}

export function RecitePanel({
  passage,
  words,
  onRetry,
  onChangePassage,
}: RecitePanelProps) {
  const surah = getSurah(passage.surah);
  const [peek, setPeek] = useState(false);
  const [summary, setSummary] = useState<HifzSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function complete(session: HifzSession) {
    const result = summarize(words, session);
    setSummary(result);
    setPeek(true);
    progressActions.recordHifz(passage.surah, result.ayahOutcomes);
    const reached = result.correct + result.wrong + result.skipped;
    if (reached === 0) return;
    if (result.accuracy === 100 && result.unreached === 0) {
      toast.success("Flawless recitation. Progress saved.");
    } else {
      toast.success(`${result.accuracy}% accurate. Progress saved.`);
    }
  }

  const { session, interim, heard, status, start, stop } = useRecitation({
    words,
    onComplete: complete,
    onError: (message) => {
      setError(message);
      toast.error(message);
    },
  });

  // Start listening as soon as the passage opens; the user pressed "Start reciting" to get here.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start();
  }, [start]);

  const tentative = useMemo(() => new Set(interim), [interim]);
  const listening = status === "listening";
  const mistakes = session.results.filter(
    (r) => r && r.status !== "correct",
  ).length;
  const settled = session.cursor;

  function begin() {
    setError(null);
    setSummary(null);
    setPeek(false);
    void start();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">
            {surah?.name}{" "}
            <span
              lang="ar"
              className="font-arabic text-muted-foreground font-normal"
            >
              {surah?.arabic}
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            {passage.from === passage.to
              ? `Ayah ${passage.from}`
              : `Ayat ${passage.from}–${passage.to}`}{" "}
            · {words.length} words
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Eye className="text-muted-foreground size-4" aria-hidden />
          Peek
          <Switch
            checked={peek}
            onCheckedChange={setPeek}
            aria-label="Show the whole passage"
          />
        </label>
      </div>

      {summary && (
        <Summary
          summary={summary}
          onRetryFromMistake={
            summary.firstMistake
              ? () =>
                  onRetry({
                    ...passage,
                    from: summary.firstMistake?.ayah ?? passage.from,
                  })
              : null
          }
          onRetry={() => onRetry(passage)}
          onChangePassage={onChangePassage}
        />
      )}

      <div className="bg-card rounded-2xl border p-4 shadow-sm sm:p-6">
        <MushafView
          words={words}
          results={session.results}
          tentative={tentative}
          cursor={listening ? settled : null}
          peek={peek}
        />
      </div>

      {status !== "done" && (
        <div className="bg-background/95 sticky bottom-20 z-30 space-y-3 rounded-2xl border p-3 shadow-lg backdrop-blur md:bottom-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="lg"
              variant={listening ? "destructive" : "default"}
              className="h-12 shrink-0 px-5"
              onClick={listening ? () => void stop() : begin}
              disabled={status === "starting"}
              aria-pressed={listening}
            >
              {status === "starting" ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : listening ? (
                <Square aria-hidden />
              ) : (
                <Mic aria-hidden />
              )}
              {status === "starting"
                ? "Starting…"
                : listening
                  ? "Finish"
                  : "Start reciting"}
            </Button>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {listening && (
                  <span className="relative flex size-2.5" aria-hidden>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                  </span>
                )}
                {listening
                  ? "Listening"
                  : status === "starting"
                    ? "Waiting for the microphone"
                    : "Ready"}
                <span className="text-muted-foreground font-normal tabular-nums">
                  · {settled}/{words.length}
                  {mistakes > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {" "}
                      · {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}
                    </span>
                  )}
                </span>
              </p>
              <p
                lang="ar"
                dir="rtl"
                className={cn(
                  "font-arabic text-muted-foreground truncate text-base",
                  !heard && "opacity-0",
                )}
                aria-hidden
              >
                {heard || "…"}
              </p>
            </div>
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <p className="sr-only" aria-live="polite">
            {mistakes > 0 ? `${mistakes} mistakes so far` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
