"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { ChoiceView } from "./choice-view";
import type { Exercise, ExerciseResult } from "./exercises";
import { MatchView } from "./match-view";
import { TypingView } from "./typing-view";

interface ExerciseRunnerProps {
  exercises: readonly Exercise[];
  label: string;
  finishLabel: string;
  autoPlayAudio?: boolean;
  onFinish: (results: ExerciseResult[]) => void;
}

/** Walks through exercises one at a time and reports first-attempt results. */
export function ExerciseRunner({
  exercises,
  label,
  finishLabel,
  autoPlayAudio = false,
  onFinish,
}: ExerciseRunnerProps) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [answered, setAnswered] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  const exercise = exercises[index];
  const isLast = index === exercises.length - 1;

  const handleAnswer = useCallback(
    (correct: boolean) => {
      setResults((prev) => [...prev, { id: exercise.id, correct }]);
      setAnswered(true);
    },
    [exercise.id],
  );

  useEffect(() => {
    if (answered) continueRef.current?.focus();
  }, [answered]);

  function next() {
    if (isLast) {
      onFinish(results);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    // Feedback and tall picture questions leave the page scrolled; show the next prompt in full.
    window.scrollTo({ top: 0 });
  }

  return (
    <section aria-label={label} className="space-y-8">
      <Progress value={(index / exercises.length) * 100}>
        <ProgressLabel>{label}</ProgressLabel>
        <ProgressValue>
          {() => `${index + 1} / ${exercises.length}`}
        </ProgressValue>
      </Progress>

      <div
        key={exercise.id}
        className="animate-in fade-in-0 slide-in-from-right-2 duration-200"
      >
        {exercise.kind === "choice" && (
          <ChoiceView
            exercise={exercise}
            onAnswer={handleAnswer}
            autoPlay={autoPlayAudio}
          />
        )}
        {exercise.kind === "match" && (
          <MatchView exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.kind === "typing" && (
          <TypingView exercise={exercise} onAnswer={handleAnswer} />
        )}
      </div>

      <div className="flex justify-end">
        <Button
          ref={continueRef}
          size="lg"
          className="h-10 px-5"
          disabled={!answered}
          onClick={next}
        >
          {isLast ? finishLabel : "Continue"}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
