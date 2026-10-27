"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { ArabicText } from "@/components/arabic-text";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LESSONS,
  nextLessonDay,
  TOTAL_LESSONS,
  completedCourseDays,
} from "@/features/curriculum/lessons";
import type { Lesson } from "@/features/curriculum/types";
import { useProgress } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";

interface Unit {
  name: string;
  lessons: Lesson[];
}

const UNITS: Unit[] = LESSONS.reduce<Unit[]>((units, lesson) => {
  const last = units.at(-1);
  if (last?.name === lesson.unit) last.lessons.push(lesson);
  else units.push({ name: lesson.unit, lessons: [lesson] });
  return units;
}, []);

export function LessonListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading lessons">
      <Skeleton className="h-24 w-full rounded-xl" />
      {[0, 1].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function LessonList() {
  const progress = useProgress();
  if (!progress) return <LessonListSkeleton />;

  const completed = completedCourseDays(progress.completed);
  const nextDay = nextLessonDay(completed);
  const next = LESSONS.find((l) => l.day === nextDay);
  const percent = Math.round((completed.size / TOTAL_LESSONS) * 100);
  const isEmpty = completed.size === 0;

  return (
    <div className="space-y-10">
      <Card>
        <CardContent className="space-y-4">
          <Progress value={percent}>
            <ProgressLabel>Course progress</ProgressLabel>
            <ProgressValue>
              {() => `${completed.size} of ${TOTAL_LESSONS} lessons`}
            </ProgressValue>
          </Progress>

          {next ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">
                  {isEmpty ? "Start here" : "Up next"}
                </p>
                <p className="truncate font-medium">
                  Day {next.day}: {next.title}
                </p>
              </div>
              <Link
                href={`/learn/${next.day}`}
                className={cn(buttonVariants({ size: "lg" }), "h-9 px-4")}
              >
                {isEmpty ? "Begin the course" : "Continue"}
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-amber-500" aria-hidden />
              You have finished every lesson. Replay any of them to sharpen your
              score.
            </p>
          )}
        </CardContent>
      </Card>

      {isEmpty && (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">No lessons completed yet</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            {TOTAL_LESSONS} lessons build up from vowels, greetings and numbers
            to verbs, opinions and real conversations. Every lesson is open, so
            jump in wherever you like.
          </p>
        </div>
      )}

      {UNITS.map((unit) => (
        <section
          key={unit.name}
          aria-labelledby={`unit-${unit.name}`}
          className="space-y-3"
        >
          <h2
            id={`unit-${unit.name}`}
            className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
          >
            {unit.name}
          </h2>
          <ul className="space-y-2">
            {unit.lessons.map((lesson) => {
              const result = progress.completed[String(lesson.day)];
              const isNext = lesson.day === nextDay;
              return (
                <li key={lesson.day}>
                  <Link
                    href={`/learn/${lesson.day}`}
                    className={cn(
                      "bg-card flex items-center gap-4 rounded-xl border p-4 transition-colors",
                      "hover:bg-muted/50 focus-visible:ring-ring/50 focus-visible:ring-3 focus-visible:outline-none",
                      isNext && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium tabular-nums",
                        result
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {result ? (
                        <CheckCircle2 className="size-5" aria-hidden />
                      ) : (
                        lesson.day
                      )}
                      {result && (
                        <span className="sr-only">
                          Completed, day {lesson.day}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {lesson.title}
                      </span>
                      <span className="text-muted-foreground block truncate text-sm">
                        {lesson.objective}
                      </span>
                    </span>
                    {result && (
                      <Badge variant="secondary">{result.score}%</Badge>
                    )}
                    {isNext && <Badge>Up next</Badge>}
                    <ArabicText
                      text={lesson.titleAr}
                      size="lg"
                      className="hidden shrink-0 sm:block"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
