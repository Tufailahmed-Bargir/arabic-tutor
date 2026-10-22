"use client";

import { useMemo, useState } from "react";

import { ArabicText } from "@/components/arabic-text";
import { cn } from "@/lib/utils";
import { createRng, shuffle, type MatchExercise } from "./exercises";

interface MatchViewProps {
  exercise: MatchExercise;
  onAnswer: (correct: boolean) => void;
}

function hashId(id: string): number {
  return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

export function MatchView({ exercise, onAnswer }: MatchViewProps) {
  const [selectedAr, setSelectedAr] = useState<string | null>(null);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [wrongEn, setWrongEn] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const englishOrder = useMemo(
    () => shuffle(exercise.pairs, createRng(hashId(exercise.id))),
    [exercise],
  );
  const done = matched.size === exercise.pairs.length;

  function pickEnglish(pairId: string) {
    if (!selectedAr || matched.has(pairId)) return;
    if (selectedAr === pairId) {
      const next = new Set(matched).add(pairId);
      setMatched(next);
      setSelectedAr(null);
      setWrongEn(null);
      if (next.size === exercise.pairs.length) onAnswer(mistakes === 0);
    } else {
      setMistakes((m) => m + 1);
      setWrongEn(pairId);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-center text-sm">
        {exercise.instruction}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2" role="group" aria-label="Arabic words">
          {exercise.pairs.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedAr === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedAr(pair.id);
                  setWrongEn(null);
                }}
                className={cn(
                  "bg-card flex min-h-14 w-full items-center justify-center rounded-xl border px-3 py-2 transition-colors",
                  "focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
                  !isMatched && !isSelected && "hover:bg-muted/60",
                  isSelected && "border-primary bg-primary/5",
                  isMatched &&
                    "border-emerald-500/40 bg-emerald-500/10 opacity-70",
                )}
              >
                <ArabicText text={pair.ar} size="lg" />
              </button>
            );
          })}
        </div>

        <div className="space-y-2" role="group" aria-label="English meanings">
          {englishOrder.map((pair) => {
            const isMatched = matched.has(pair.id);
            return (
              <button
                key={pair.id}
                type="button"
                disabled={isMatched || !selectedAr}
                onClick={() => pickEnglish(pair.id)}
                className={cn(
                  "bg-card flex min-h-14 w-full items-center justify-center rounded-xl border px-3 py-2 text-center text-sm transition-colors",
                  "focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
                  !isMatched && selectedAr && "hover:bg-muted/60",
                  wrongEn === pair.id &&
                    "animate-pulse border-rose-500/50 bg-rose-500/10",
                  isMatched &&
                    "border-emerald-500/40 bg-emerald-500/10 opacity-70",
                )}
              >
                {pair.en}
              </button>
            );
          })}
        </div>
      </div>

      <div
        aria-live="polite"
        className="text-muted-foreground min-h-6 text-center text-sm"
      >
        {wrongEn && "Not a match. Try another meaning."}
        {done &&
          (mistakes === 0 ? "All matched on the first try." : "All matched.")}
      </div>
    </div>
  );
}
