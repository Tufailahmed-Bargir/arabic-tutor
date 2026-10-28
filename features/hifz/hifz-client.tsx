"use client";

import { useState, useSyncExternalStore } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { isRecognitionSupported } from "@/lib/recognition";
import { fetchSurahFile, surahWords } from "./quran";
import { RecitePanel } from "./recite-panel";
import { SetupForm, type Passage } from "./setup-form";
import type { QuranSurahFile, QuranWord } from "./types";

const DEFAULT_PASSAGE: Passage = { surah: 1, from: 1, to: 7 };

type Stage =
  | { kind: "setup" }
  | { kind: "recite"; passage: Passage; words: QuranWord[]; run: number };

const noop = () => () => {};

export function HifzClient() {
  // Speech support is only known in the browser; assume it during server render.
  const supported = useSyncExternalStore(
    noop,
    isRecognitionSupported,
    () => true,
  );
  const [stage, setStage] = useState<Stage>({ kind: "setup" });
  const [passage, setPassage] = useState<Passage>(DEFAULT_PASSAGE);
  const [cache, setCache] = useState<Map<number, QuranSurahFile>>(new Map());

  async function open(next: Passage) {
    try {
      const file = cache.get(next.surah) ?? (await fetchSurahFile(next.surah));
      setCache((c) => new Map(c).set(next.surah, file));
      setPassage(next);
      setStage((s) => ({
        kind: "recite",
        passage: next,
        words: surahWords(file, next.from, next.to),
        run: (s.kind === "recite" ? s.run : 0) + 1,
      }));
    } catch {
      toast.error(
        "Couldn’t load the surah. Check your connection and try again.",
      );
    }
  }

  if (stage.kind === "recite") {
    return (
      <RecitePanel
        key={stage.run}
        passage={stage.passage}
        words={stage.words}
        onRetry={(p) => void open(p)}
        onChangePassage={() => setStage({ kind: "setup" })}
      />
    );
  }

  return (
    <div className="space-y-4">
      {!supported && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-amber-500"
            aria-hidden
          />
          This browser can’t recognise speech, so it can’t check your
          recitation. Open this page in Chrome, Edge or Safari.
        </div>
      )}
      <SetupForm defaultValues={passage} onStart={open} disabled={!supported} />
    </div>
  );
}
