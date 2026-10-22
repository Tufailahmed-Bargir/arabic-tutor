"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PartyPopper, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { getWord } from "@/features/curriculum/lessons";
import { progressActions } from "@/features/progress/use-progress";
import type { Rating } from "@/lib/srs";
import { cn } from "@/lib/utils";

const RATINGS: readonly {
  label: string;
  rating: Rating;
  key: string;
  className: string;
}[] = [
  {
    label: "Again",
    rating: 0,
    key: "1",
    className: "text-red-600 dark:text-red-400",
  },
  {
    label: "Hard",
    rating: 3,
    key: "2",
    className: "text-orange-600 dark:text-orange-400",
  },
  {
    label: "Good",
    rating: 4,
    key: "3",
    className: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Easy",
    rating: 5,
    key: "4",
    className: "text-sky-600 dark:text-sky-400",
  },
];

interface ReviewSessionProps {
  initialQueue: string[];
}

export function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const [queue, setQueue] = useState<string[]>(initialQueue);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [lapses, setLapses] = useState(0);

  const total = initialQueue.length;
  const wordId = queue[index];
  const word = wordId ? getWord(wordId) : undefined;
  const finished = index >= queue.length;

  const rate = useCallback(
    (rating: Rating) => {
      if (!wordId) return;
      progressActions.rateCard(wordId, rating);
      if (rating === 0) {
        setLapses((n) => n + 1);
        setQueue((q) => [...q, wordId]);
      }
      const isLast = index + 1 >= queue.length + (rating === 0 ? 1 : 0);
      if (isLast) toast.success("Review complete — nice work!");
      setIndex((i) => i + 1);
      setRevealed(false);
    },
    [wordId, index, queue.length],
  );

  useEffect(() => {
    if (finished) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === " " || event.key === "Enter") {
        if (!revealed) {
          event.preventDefault();
          setRevealed(true);
        }
        return;
      }
      const match = RATINGS.find((r) => r.key === event.key);
      if (match && revealed) rate(match.rating);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finished, revealed, rate]);

  if (finished) {
    return (
      <div className="via-card to-card flex flex-col items-center gap-5 rounded-2xl border bg-gradient-to-br from-emerald-500/10 px-6 py-14 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
          <PartyPopper className="size-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Session complete</h2>
          <p className="text-muted-foreground text-sm">
            You reviewed {total} {total === 1 ? "card" : "cards"}
            {lapses > 0
              ? ` and repeated ${lapses} ${lapses === 1 ? "one" : "ones"} you missed.`
              : " without a miss."}
          </p>
        </div>
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="space-y-3 rounded-2xl border px-6 py-10 text-center">
        <p className="text-muted-foreground text-sm">
          This card is no longer in the curriculum.
        </p>
        <Button variant="outline" onClick={() => rate(4)}>
          <RotateCcw data-icon="inline-start" />
          Skip card
        </Button>
      </div>
    );
  }

  const progressPct = Math.round((Math.min(index, total) / total) * 100);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Card {Math.min(index + 1, queue.length)} of {queue.length}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Review progress"
          className="bg-muted h-1.5 overflow-hidden rounded-full"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div
        className="bg-card relative flex min-h-80 flex-col items-center justify-center gap-6 rounded-2xl border p-6 text-center shadow-sm"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <ArabicText text={word.ar} size="2xl" forceHarakat />
          <SpeakButton text={word.ar} />
        </div>

        {revealed ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-1 duration-200">
            <p className="text-muted-foreground text-lg">{word.tr}</p>
            <p className="text-2xl font-semibold tracking-tight">{word.en}</p>
          </div>
        ) : (
          <Button size="lg" variant="outline" onClick={() => setRevealed(true)}>
            Show answer
            <kbd className="text-muted-foreground ms-1 hidden rounded border px-1.5 text-[10px] sm:inline">
              Space
            </kbd>
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid grid-cols-4 gap-2 transition-opacity",
          !revealed && "pointer-events-none opacity-40",
        )}
        aria-hidden={!revealed}
      >
        {RATINGS.map((r) => (
          <Button
            key={r.label}
            variant="outline"
            size="lg"
            disabled={!revealed}
            onClick={() => rate(r.rating)}
            className={cn("h-12 flex-col gap-0", r.className)}
          >
            <span className="font-medium">{r.label}</span>
            <span className="text-muted-foreground hidden text-[10px] sm:block">
              {r.key}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
