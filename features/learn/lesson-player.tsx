"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

import { ArabicText } from "@/components/arabic-text";
import { Badge } from "@/components/ui/badge";
import { nextLessonDay } from "@/features/curriculum/lessons";
import type { Lesson } from "@/features/curriculum/types";
import { progressActions, useProgress } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";
import {
  buildListenRound,
  buildQuiz,
  scoreResults,
  type ExerciseResult,
  type QuizScore,
} from "./exercises";
import { ExerciseRunner } from "./exercise-runner";
import { LearnStep } from "./learn-step";
import { ResultsStep } from "./results-step";

type Step = "learn" | "listen" | "quiz" | "results";

const STEPS: readonly { id: Step; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "listen", label: "Listen" },
  { id: "quiz", label: "Quiz" },
  { id: "results", label: "Results" },
];

function Stepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2" aria-label="Lesson steps">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 items-center gap-2"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-medium transition-colors",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary/15 text-primary ring-primary/40 ring-1",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3" aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:inline",
                active ? "font-medium" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="bg-border h-px flex-1" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const progress = useProgress();
  const [step, setStep] = useState<Step>("learn");
  const [attempt, setAttempt] = useState(1);
  const [score, setScore] = useState<QuizScore | null>(null);
  const [nextDay, setNextDay] = useState<number | null>(null);

  const listenRound = useMemo(
    () => buildListenRound(lesson, attempt),
    [lesson, attempt],
  );
  const quiz = useMemo(() => buildQuiz(lesson, attempt), [lesson, attempt]);

  function finishQuiz(results: ExerciseResult[]) {
    const final = scoreResults(results);
    const previous = progress?.completed[String(lesson.day)]?.score;
    if (previous === undefined || final.percent > previous) {
      progressActions.completeLesson(lesson.day, final.percent);
    }

    const completed = new Set(
      Object.keys(progress?.completed ?? {}).map(Number),
    );
    completed.add(lesson.day);
    setNextDay(nextLessonDay(completed));
    setScore(final);
    setStep("results");
    toast.success(`Lesson ${lesson.day} complete`, {
      description: `${final.percent}% on the quiz.`,
    });
  }

  function retry() {
    setAttempt((a) => a + 1);
    setScore(null);
    setStep("quiz");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/learn"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden />
          All lessons
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="secondary">
              Day {lesson.day} · {lesson.unit}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lesson.title}
            </h1>
          </div>
          <ArabicText text={lesson.titleAr} size="xl" className="shrink-0" />
        </div>
        <Stepper current={step} />
      </header>

      <div key={step} className="animate-in fade-in-0 duration-200">
        {step === "learn" && (
          <LearnStep lesson={lesson} onContinue={() => setStep("listen")} />
        )}
        {step === "listen" && (
          <ExerciseRunner
            exercises={listenRound}
            label="Listen"
            finishLabel="Start the quiz"
            autoPlayAudio
            onFinish={() => setStep("quiz")}
          />
        )}
        {step === "quiz" && (
          <ExerciseRunner
            key={attempt}
            exercises={quiz}
            label="Quiz"
            finishLabel="See results"
            onFinish={finishQuiz}
          />
        )}
        {step === "results" && score && (
          <ResultsStep
            lesson={lesson}
            score={score}
            streak={progress?.streak.current ?? null}
            nextDay={nextDay}
            onRetry={retry}
          />
        )}
      </div>
    </div>
  );
}
