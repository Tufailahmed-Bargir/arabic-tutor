"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Flame,
  Layers,
  Mic,
  PartyPopper,
} from "lucide-react";
import { ArabicText } from "@/components/arabic-text";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dueWordIds, useProgress } from "@/features/progress/use-progress";
import {
  getLesson,
  nextLessonDay,
  TOTAL_LESSONS,
} from "@/features/curriculum/lessons";
import { toDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { ActivityHeatmap } from "./activity-heatmap";
import { PracticeCard } from "./practice-card";
import { ProgressRing } from "./progress-ring";
import { greeting, liveStreak } from "./stats";

function DashboardSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading your dashboard"
    >
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  );
}

export function DashboardClient() {
  const progress = useProgress();
  if (!progress) return <DashboardSkeleton />;

  const now = new Date();
  const today = toDateKey(now);
  const hello = greeting(now.getHours());
  const completedDays = new Set(Object.keys(progress.completed).map(Number));
  const nextDay = nextLessonDay(completedDays);
  const nextLesson = nextDay === null ? undefined : getLesson(nextDay);
  const due = dueWordIds(progress, today).length;
  const streak = liveStreak(progress.streak, today);
  const isNew =
    completedDays.size === 0 && Object.keys(progress.cards).length === 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-muted-foreground text-sm">{hello.en}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {isNew ? "Let’s start your Arabic journey" : "Welcome back"}
          </h1>
        </div>
        <ArabicText
          text={hello.ar}
          size="lg"
          forceHarakat
          className="text-emerald-600 dark:text-emerald-400"
        />
      </header>

      <PracticeCard progress={progress} today={today} />

      <Card className="via-card to-card relative overflow-hidden bg-gradient-to-br from-emerald-500/10">
        <CardHeader>
          <p className="text-xs font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            {nextLesson
              ? isNew
                ? "Day 1"
                : `Up next · Day ${nextLesson.day}`
              : "All caught up"}
          </p>
          <CardTitle className="text-xl sm:text-2xl">
            {nextLesson ? nextLesson.title : "You finished every lesson"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {nextLesson ? (
            <>
              <div className="space-y-2">
                <ArabicText text={nextLesson.titleAr} size="xl" forceHarakat />
                <p className="text-muted-foreground max-w-md text-sm">
                  {nextLesson.objective}
                </p>
              </div>
              <Link
                href={`/learn/${nextLesson.day}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                {isNew ? "Start lesson 1" : "Continue"}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground flex max-w-md items-center gap-2 text-sm">
                <PartyPopper
                  className="size-4 shrink-0 text-emerald-500"
                  aria-hidden
                />
                Review your flashcards and practise speaking to keep every word
                fresh.
              </p>
              <Link
                href="/review"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Open review
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full bg-orange-500/10 text-orange-500">
              <Flame className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {streak}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  {streak === 1 ? "day" : "days"}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                {streak === 0
                  ? "Learn today to start a streak"
                  : `Longest: ${progress.streak.longest}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full bg-sky-500/10 text-sky-500">
              <Layers className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-semibold tabular-nums">
                {due}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  due
                </span>
              </p>
              {due > 0 ? (
                <Link
                  href="/review"
                  className="text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  Review now →
                </Link>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {Object.keys(progress.cards).length === 0
                    ? "Finish a lesson to add cards"
                    : "Nothing to review"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex items-center gap-4">
            <ProgressRing
              value={completedDays.size}
              total={TOTAL_LESSONS}
              label="Lessons completed"
            />
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {completedDays.size}
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  / {TOTAL_LESSONS}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">lessons done</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="size-4 text-emerald-500" aria-hidden />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap activity={progress.activity} today={today} />
          </CardContent>
        </Card>

        <Card className="via-card to-card bg-gradient-to-br from-violet-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="size-4 text-violet-500" aria-hidden />
              Speak with your tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Practise today’s words out loud in a live conversation. Every
              reply appears in Arabic script.
            </p>
            <Link
              href="/talk"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Start conversation
              <ArrowRight data-icon="inline-end" />
            </Link>
            {progress.talkSessions > 0 && (
              <p className="text-muted-foreground text-xs">
                {progress.talkSessions}{" "}
                {progress.talkSessions === 1 ? "conversation" : "conversations"}{" "}
                so far
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <nav
        aria-label="More"
        className="text-muted-foreground flex items-center justify-center gap-4 pt-2 text-sm"
      >
        <Link
          href="/alphabet"
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Alphabet
        </Link>
        <span aria-hidden>·</span>
        <Link
          href="/settings"
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Settings
        </Link>
      </nav>
    </div>
  );
}
