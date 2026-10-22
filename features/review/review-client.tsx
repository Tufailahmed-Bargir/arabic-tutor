"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCheck, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dueWordIds, useProgress } from "@/features/progress/use-progress";
import { daysBetween, toDateKey } from "@/lib/date";
import type { ProgressState } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ReviewSession } from "./review-session";

function EmptyState({
  hasCards,
  nextDue,
  today,
}: {
  hasCards: boolean;
  nextDue: string | null;
  today: string;
}) {
  const days = nextDue ? daysBetween(today, nextDue) : null;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
        {hasCards ? (
          <CheckCheck className="size-7" aria-hidden />
        ) : (
          <Layers className="size-7" aria-hidden />
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {hasCards ? "You’re all caught up" : "No flashcards yet"}
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          {hasCards
            ? days !== null && days > 0
              ? `Your next card is due in ${days} ${days === 1 ? "day" : "days"}. Come back then, or learn something new.`
              : "Nothing is due right now. Learn something new while you wait."
            : "Words from each lesson you finish are added here and resurface just before you would forget them."}
        </p>
      </div>
      <Link href="/dashboard" className={cn(buttonVariants())}>
        {hasCards ? "Back to dashboard" : "Start a lesson"}
      </Link>
    </div>
  );
}

/** Freezes the due queue on mount so rating the last card shows the summary, not the empty state. */
function ReviewGate({ progress }: { progress: ProgressState }) {
  const today = toDateKey();
  const [due] = useState(() => dueWordIds(progress, today));

  if (due.length === 0) {
    const dates = Object.values(progress.cards)
      .map((c) => c.due)
      .sort();
    return (
      <EmptyState
        hasCards={dates.length > 0}
        nextDue={dates[0] ?? null}
        today={today}
      />
    );
  }

  return <ReviewSession initialQueue={due} />;
}

export function ReviewClient() {
  const progress = useProgress();

  if (!progress) {
    return (
      <div
        className="space-y-4"
        aria-busy="true"
        aria-label="Loading flashcards"
      >
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return <ReviewGate progress={progress} />;
}
