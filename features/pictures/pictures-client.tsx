"use client";

import { useMemo, useState } from "react";
import { ImageIcon, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  ALL_LESSONS,
  ALPHABET_LESSONS,
  completedCourseDays,
} from "@/features/curriculum/lessons";
import type { Word } from "@/features/curriculum/types";
import { ExerciseRunner } from "@/features/learn/exercise-runner";
import {
  buildPictureQuiz,
  pictureWords,
  scoreResults,
  type QuizScore,
} from "@/features/learn/exercises";
import { progressActions, useProgress } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";

const QUESTIONS = 10;

/** Alphabet-unit nouns count as known, so a new learner can start straight away. */
function poolFor(done: ReadonlySet<number>, everything: boolean): Word[] {
  const lessons = everything
    ? ALL_LESSONS
    : [...ALPHABET_LESSONS, ...ALL_LESSONS.filter((l) => done.has(l.day))];
  return pictureWords(lessons.flatMap((l) => l.words));
}

export function PicturesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading quiz">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

function Results({
  score,
  onAgain,
}: {
  score: QuizScore;
  onAgain: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 py-4 text-center">
        <Trophy
          className={cn(
            "mx-auto size-10",
            score.percent >= 80 ? "text-amber-500" : "text-muted-foreground",
          )}
          aria-hidden
        />
        <div>
          <p className="text-4xl font-semibold tabular-nums">
            {score.percent}%
          </p>
          <p className="text-muted-foreground text-sm">
            {score.correct} of {score.total} correct
          </p>
        </div>
        <Button onClick={onAgain}>
          <RotateCcw aria-hidden />
          Play again
        </Button>
      </CardContent>
    </Card>
  );
}

export function PicturesClient() {
  const progress = useProgress();
  const [everything, setEverything] = useState(false);
  const [round, setRound] = useState<number | null>(null);
  const [score, setScore] = useState<QuizScore | null>(null);

  const done = useMemo(
    () => (progress ? completedCourseDays(progress.completed) : null),
    [progress],
  );
  const pool = useMemo(
    () => (done ? poolFor(done, everything) : []),
    [done, everything],
  );
  const exercises = useMemo(
    () => (round === null ? [] : buildPictureQuiz(pool, round, QUESTIONS)),
    // The pool is frozen for the round so a progress update cannot reshuffle it mid-quiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );

  if (!progress) return <PicturesSkeleton />;

  function start() {
    setScore(null);
    setRound(Math.floor(Math.random() * 100_000) + 1);
  }

  if (round !== null && score) {
    return (
      <Results
        score={score}
        onAgain={() => {
          start();
        }}
      />
    );
  }

  if (round !== null) {
    return (
      <ExerciseRunner
        key={round}
        exercises={exercises}
        label="Picture quiz"
        finishLabel="See my score"
        onFinish={(results) => {
          const result = scoreResults(results);
          progressActions.recordActivity();
          toast.success(`Picture quiz: ${result.percent}%`);
          setScore(result);
        }}
      />
    );
  }

  return (
    <Card className="via-card to-card bg-gradient-to-br from-violet-500/10">
      <CardContent className="space-y-5">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-violet-500/10 text-violet-500">
            <ImageIcon className="size-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <h2 className="font-semibold tracking-tight">
              {QUESTIONS} questions, three ways to play
            </h2>
            <p className="text-muted-foreground text-sm">
              Name the picture in English, pick the Arabic for it, or find the
              picture that matches a word. {pool.length} pictures are in your
              pool.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="all-pictures"
            checked={everything}
            onCheckedChange={setEverything}
          />
          <label htmlFor="all-pictures" className="text-sm">
            Include words from lessons I have not done yet
          </label>
        </div>
        <Button size="lg" onClick={start} disabled={pool.length < 4}>
          Start the quiz
        </Button>
      </CardContent>
    </Card>
  );
}
