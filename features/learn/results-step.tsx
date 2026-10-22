"use client";

import Link from "next/link";
import { Flame, RotateCcw, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/features/curriculum/types";
import type { QuizScore } from "./exercises";

interface ResultsStepProps {
  lesson: Lesson;
  score: QuizScore;
  streak: number | null;
  nextDay: number | null;
  onRetry: () => void;
}

function headline(percent: number): string {
  if (percent === 100) return "Flawless";
  if (percent >= 80) return "Strong work";
  if (percent >= 60) return "Good progress";
  return "Keep practising";
}

export function ResultsStep({
  lesson,
  score,
  streak,
  nextDay,
  onRetry,
}: ResultsStepProps) {
  return (
    <section
      aria-labelledby="results-heading"
      className="space-y-6 text-center"
    >
      <div className="bg-primary/10 mx-auto flex size-14 items-center justify-center rounded-2xl">
        <Trophy className="text-primary size-7" aria-hidden />
      </div>

      <div className="space-y-1">
        <h2
          id="results-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          {headline(score.percent)}
        </h2>
        <p className="text-muted-foreground text-sm">
          You finished “{lesson.title}”.
        </p>
      </div>

      <Card size="sm">
        <CardContent className="divide-border grid grid-cols-3 divide-x text-center rtl:divide-x-reverse">
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {score.percent}%
            </p>
            <p className="text-muted-foreground text-xs">Score</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {score.correct}/{score.total}
            </p>
            <p className="text-muted-foreground text-xs">First try</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">
              {lesson.words.length}
            </p>
            <p className="text-muted-foreground text-xs">New words</p>
          </div>
        </CardContent>
      </Card>

      {streak !== null && streak > 0 && (
        <Badge variant="secondary" className="h-7 gap-1.5 px-3 text-sm">
          <Flame className="text-orange-500" aria-hidden />
          {streak} day streak
        </Badge>
      )}

      <p className="text-muted-foreground text-sm">
        Your new words are now in your review queue. They come back at spaced
        intervals so they stick.
      </p>

      <div className="flex flex-col-reverse justify-center gap-2 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          className="h-10 px-4"
          onClick={onRetry}
        >
          <RotateCcw data-icon="inline-start" aria-hidden />
          Try the quiz again
        </Button>
        {nextDay !== null ? (
          <Link
            href={`/learn/${nextDay}`}
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Next lesson
          </Link>
        ) : (
          <Link
            href="/learn"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-5")}
          >
            Back to lessons
          </Link>
        )}
      </div>
    </section>
  );
}
