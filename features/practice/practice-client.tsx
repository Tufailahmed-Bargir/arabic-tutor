"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Flame,
  Layers,
  MessageCircle,
  Mic,
  PartyPopper,
} from "lucide-react";

import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LESSONS, getWord } from "@/features/curriculum/lessons";
import type { Word } from "@/features/curriculum/types";
import { createRng, shuffle } from "@/features/learn/exercises";
import {
  dueWordIds,
  isPracticeComplete,
  progressActions,
  todayPractice,
  useProgress,
} from "@/features/progress/use-progress";
import { toDateKey } from "@/lib/date";
import type { ProgressState } from "@/lib/storage";
import type { Rating } from "@/lib/srs";
import { cn } from "@/lib/utils";
import { SpeakingDrill } from "./speaking-drill";

const REVIEW_CAP = 10;
const SPEAK_COUNT = 5;

function dateSeed(dateKey: string): number {
  return Number(dateKey.replaceAll("-", ""));
}

function pickSpeakingWords(progress: ProgressState, today: string): Word[] {
  const done = new Set(Object.keys(progress.completed).map(Number));
  const lessons = LESSONS.filter((l) => done.has(l.day));
  const pool = (lessons.length > 0 ? lessons : LESSONS.slice(0, 1)).flatMap(
    (l) => l.words,
  );
  return shuffle(pool, createRng(dateSeed(today))).slice(0, SPEAK_COUNT);
}

type StepState = "done" | "active" | "upcoming";

function Step({
  index,
  title,
  description,
  icon,
  state,
  children,
}: {
  index: number;
  title: string;
  description: string;
  icon: ReactNode;
  state: StepState;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`step-${index}`}
      className={cn(
        "rounded-2xl border p-4 transition-colors sm:p-5",
        state === "active" && "bg-card shadow-sm",
        state === "upcoming" && "opacity-60",
      )}
    >
      <header className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
            state === "done"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {state === "done" ? (
            <Check className="size-4" aria-label="Done" />
          ) : (
            icon
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={`step-${index}`}
            className="text-sm font-semibold tracking-tight"
          >
            {index}. {title}
          </h2>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </header>
      {state === "active" && children && <div className="mt-5">{children}</div>}
    </section>
  );
}

function PracticeReview({
  ids,
  onFinish,
}: {
  ids: string[];
  onFinish: () => void;
}) {
  const [queue, setQueue] = useState(ids);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const word = getWord(queue[index] ?? "");
  const finished = index >= queue.length;

  useEffect(() => {
    if (finished) onFinish();
  }, [finished, onFinish]);

  if (finished) return null;

  function rate(rating: Rating) {
    const id = queue[index];
    if (id) {
      progressActions.rateCard(id, rating);
      if (rating === 0) setQueue((q) => [...q, id]);
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  }

  if (!word) {
    return (
      <Button variant="outline" onClick={() => rate(4)}>
        Skip card
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs">
        Card {index + 1} of {queue.length}
      </p>
      <div className="flex flex-col items-center gap-3 rounded-xl border p-5 text-center">
        <div className="flex items-center gap-3">
          <ArabicText text={word.ar} size="xl" forceHarakat />
          <SpeakButton text={word.ar} />
        </div>
        {revealed ? (
          <div className="animate-in fade-in space-y-0.5 duration-200">
            <p className="text-muted-foreground">{word.tr}</p>
            <p className="text-xl font-semibold">{word.en}</p>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setRevealed(true)}>
            Show answer
          </Button>
        )}
      </div>
      <div
        className={cn(
          "grid grid-cols-4 gap-2",
          !revealed && "pointer-events-none opacity-40",
        )}
        aria-hidden={!revealed}
      >
        {(
          [
            ["Again", 0],
            ["Hard", 3],
            ["Good", 4],
            ["Easy", 5],
          ] as const
        ).map(([label, rating]) => (
          <Button
            key={label}
            variant="outline"
            size="lg"
            disabled={!revealed}
            onClick={() => rate(rating)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function SpeakingRound({
  words,
  onFinish,
}: {
  words: Word[];
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const word = words[index];

  useEffect(() => {
    if (!word) onFinish();
  }, [word, onFinish]);

  if (!word) return null;

  const next = () => setIndex((i) => i + 1);
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs">
        Word {index + 1} of {words.length}
      </p>
      <SpeakingDrill
        key={word.id}
        word={word}
        onRate={(rating) => {
          progressActions.rateSpoken(word.id, rating);
          next();
        }}
        onSkip={next}
      />
    </div>
  );
}

function PracticeSession({ progress }: { progress: ProgressState }) {
  const today = toDateKey();
  const day = todayPractice(progress, today);

  // The queues are fixed when the session opens so rating a card never reshuffles the list.
  const [reviewIds] = useState(() =>
    dueWordIds(progress, today).slice(0, REVIEW_CAP),
  );
  const [speakWords] = useState(() => pickSpeakingWords(progress, today));

  const noLessons = Object.keys(progress.completed).length === 0;
  const complete = isPracticeComplete(day);

  useEffect(() => {
    if (reviewIds.length === 0 && !day.reviewDone)
      progressActions.updatePractice({ reviewDone: true });
  }, [reviewIds.length, day.reviewDone]);

  const flags = [day.reviewDone, day.speakDone, day.talkDone];
  const activeIndex = flags.findIndex((f) => !f);
  const stateOf = (i: number): StepState =>
    flags[i] ? "done" : i === activeIndex ? "active" : "upcoming";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daily practice
        </h1>
        <p className="text-muted-foreground text-sm">
          About ten minutes: review, say it out loud, then talk with your tutor.
        </p>
      </header>

      {noLessons && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          You haven’t finished a lesson yet, so today’s words come from Day 1.{" "}
          <Link
            href="/learn/1"
            className="font-medium underline underline-offset-4"
          >
            Start Lesson 1
          </Link>{" "}
          to unlock more.
        </div>
      )}

      {complete && (
        <div className="via-card to-card flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-emerald-500/10 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
            <PartyPopper className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Today’s practice is done</h2>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Flame className="size-4 text-orange-500" aria-hidden />
              {progress.streak.current}-day streak. See you tomorrow.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline" })}
          >
            Dashboard
          </Link>
        </div>
      )}

      <div className="space-y-3">
        <Step
          index={1}
          title="Review"
          description={
            reviewIds.length > 0
              ? `${reviewIds.length} cards are due`
              : "Nothing due today"
          }
          icon={<Layers className="size-4" aria-hidden />}
          state={stateOf(0)}
        >
          <PracticeReview
            ids={reviewIds}
            onFinish={() =>
              progressActions.updatePractice({ reviewDone: true })
            }
          />
        </Step>

        <Step
          index={2}
          title="Say it out loud"
          description={`${speakWords.length} words: listen, record yourself, compare`}
          icon={<Mic className="size-4" aria-hidden />}
          state={stateOf(1)}
        >
          <SpeakingRound
            words={speakWords}
            onFinish={() => progressActions.updatePractice({ speakDone: true })}
          />
        </Step>

        <Step
          index={3}
          title="Talk with your tutor"
          description="A short voice conversation using what you’ve learned"
          icon={<MessageCircle className="size-4" aria-hidden />}
          state={stateOf(2)}
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Open the tutor, say hello, and keep going for a few minutes. This
              step ticks itself off when a conversation connects.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/talk" className={buttonVariants({ size: "lg" })}>
                Start talking
                <ArrowRight data-icon="inline-end" aria-hidden />
              </Link>
              <Button
                variant="ghost"
                size="lg"
                onClick={() =>
                  progressActions.updatePractice({ talkDone: true })
                }
              >
                Skip for today
              </Button>
            </div>
          </div>
        </Step>
      </div>
    </div>
  );
}

export function PracticeClient() {
  const progress = useProgress();
  if (!progress) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }
  return <PracticeSession progress={progress} />;
}
