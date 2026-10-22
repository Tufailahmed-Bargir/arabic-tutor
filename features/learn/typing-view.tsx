"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnswerFeedback } from "./answer-feedback";
import { isTypingCorrect, type TypingExercise } from "./exercises";

const schema = z.object({
  answer: z.string().trim().min(1, "Type your answer first."),
});
type Values = z.infer<typeof schema>;

interface TypingViewProps {
  exercise: TypingExercise;
  onAnswer: (correct: boolean) => void;
}

export function TypingView({ exercise, onAnswer }: TypingViewProps) {
  const [correct, setCorrect] = useState<boolean | null>(null);
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { answer: "" },
  });

  useEffect(() => setFocus("answer"), [setFocus]);

  const locked = correct !== null;

  function submit(values: Values) {
    const ok = isTypingCorrect(values.answer, exercise.answers);
    setCorrect(ok);
    onAnswer(ok);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-sm">{exercise.instruction}</p>
        <div className="flex items-center justify-center gap-2">
          <ArabicText text={exercise.promptAr} size="2xl" />
          <SpeakButton text={exercise.audio} />
        </div>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <label htmlFor={`answer-${exercise.id}`} className="sr-only">
            English meaning
          </label>
          <Input
            id={`answer-${exercise.id}`}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="English meaning"
            disabled={locked || isSubmitting}
            aria-invalid={errors.answer ? true : undefined}
            aria-describedby={
              errors.answer ? `answer-error-${exercise.id}` : undefined
            }
            className="h-11 text-base"
            {...register("answer")}
          />
          {errors.answer && (
            <p
              id={`answer-error-${exercise.id}`}
              role="alert"
              className="text-destructive text-sm"
            >
              {errors.answer.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-11 px-5"
          disabled={locked || isSubmitting}
        >
          Check
        </Button>
      </form>

      <AnswerFeedback correct={correct} reveal={exercise.reveal} />
    </div>
  );
}
