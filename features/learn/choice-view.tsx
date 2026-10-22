"use client";

import { useEffect, useState } from "react";

import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { speakArabic } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { AnswerFeedback } from "./answer-feedback";
import type { ChoiceExercise } from "./exercises";

interface ChoiceViewProps {
  exercise: ChoiceExercise;
  onAnswer: (correct: boolean) => void;
  autoPlay?: boolean;
}

export function ChoiceView({
  exercise,
  onAnswer,
  autoPlay = false,
}: ChoiceViewProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;

  useEffect(() => {
    if (!autoPlay || !exercise.audio) return;
    speakArabic(exercise.audio).catch(() => undefined);
  }, [autoPlay, exercise.audio]);

  function choose(optionId: string) {
    if (answered) return;
    setPicked(optionId);
    onAnswer(optionId === exercise.answerId);
  }

  useEffect(() => {
    if (answered) return;
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const option = exercise.options[Number(event.key) - 1];
      if (!option) return;
      setPicked(option.id);
      onAnswer(option.id === exercise.answerId);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, exercise, onAnswer]);

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-sm">{exercise.instruction}</p>
        {exercise.promptAr && (
          <div className="flex items-center justify-center gap-2">
            <ArabicText text={exercise.promptAr} size="2xl" />
            {exercise.audio && <SpeakButton text={exercise.audio} />}
          </div>
        )}
        {exercise.promptText && (
          <p className="text-2xl font-semibold tracking-tight">
            {exercise.promptText}
          </p>
        )}
        {!exercise.promptAr && exercise.audio && (
          <div className="flex justify-center gap-2">
            <SpeakButton text={exercise.audio} />
            <SpeakButton text={exercise.audio} slow />
          </div>
        )}
      </div>

      <div
        role="group"
        aria-label="Answer options"
        className="grid gap-2 sm:grid-cols-2"
      >
        {exercise.options.map((option, i) => {
          const isAnswer = option.id === exercise.answerId;
          const isPicked = option.id === picked;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              disabled={answered}
              className={cn(
                "bg-card flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 text-start transition-colors",
                "focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
                !answered && "hover:border-foreground/30 hover:bg-muted/60",
                answered &&
                  isAnswer &&
                  "border-emerald-500/50 bg-emerald-500/10",
                answered &&
                  isPicked &&
                  !isAnswer &&
                  "border-rose-500/50 bg-rose-500/10",
                answered && !isAnswer && !isPicked && "opacity-60",
              )}
            >
              <kbd
                aria-hidden
                className="text-muted-foreground hidden size-5 shrink-0 items-center justify-center rounded border text-[0.65rem] sm:flex"
              >
                {i + 1}
              </kbd>
              <span
                className={cn(
                  "flex-1",
                  option.arabic ? "text-center" : "text-base",
                )}
              >
                {option.arabic ? (
                  <ArabicText text={option.label} size="xl" />
                ) : (
                  option.label
                )}
              </span>
              {answered && (isAnswer || isPicked) && (
                <span className="sr-only">
                  {isAnswer ? "Correct answer" : "Your answer, incorrect"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnswerFeedback
        correct={answered ? picked === exercise.answerId : null}
        reveal={exercise.reveal}
      />
    </div>
  );
}
