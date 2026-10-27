"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Circle,
  Mic,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { completedCourseDays } from "@/features/curriculum/lessons";
import { ExerciseRunner } from "@/features/learn/exercise-runner";
import { scoreResults, type QuizScore } from "@/features/learn/exercises";
import { progressActions, useProgress } from "@/features/progress/use-progress";
import { SCENARIOS, type Scenario } from "@/features/talk/scenarios";
import type { ProgressState } from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  CHECKPOINTS,
  PASS_MARK,
  achievements,
  buildCheckpointQuiz,
  checkpointProgress,
  isEarned,
  missionId,
  type Achievement,
  type Checkpoint,
} from "./challenges";

// In course order, so the next mission to try is always near the top.
const MISSIONS = [...SCENARIOS].sort((a, b) => a.afterDay - b.afterDay);

function ChallengesSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading challenges">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  icon,
  title,
  description,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2
        id={id}
        className="flex items-center gap-2 text-lg font-semibold tracking-tight"
      >
        {icon}
        {title}
      </h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function MissionCard({
  scenario,
  done,
  ready,
}: {
  scenario: Scenario;
  done: boolean;
  ready: boolean;
}) {
  return (
    <li className="bg-card flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{scenario.title}</p>
          <p className="text-muted-foreground text-sm">{scenario.summary}</p>
        </div>
        {done ? (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            Done
          </Badge>
        ) : (
          !ready && (
            <Badge variant="secondary">After day {scenario.afterDay}</Badge>
          )
        )}
      </div>
      <ul className="space-y-1.5 text-sm" aria-label="Goals">
        {scenario.goals.map((goal) => (
          <li key={goal} className="flex items-start gap-2">
            {done ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-500"
                aria-hidden
              />
            ) : (
              <Circle
                className="text-muted-foreground mt-0.5 size-4 shrink-0"
                aria-hidden
              />
            )}
            {goal}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link
          href={`/talk?topic=scenario-${scenario.id}`}
          className={buttonVariants({ size: "sm" })}
        >
          <Mic aria-hidden />
          {done ? "Play again" : "Start mission"}
        </Link>
        {!done && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              progressActions.completeChallenge(missionId(scenario.id), 100);
              toast.success(`Mission complete: ${scenario.title}`);
            }}
          >
            I did it
          </Button>
        )}
      </div>
    </li>
  );
}

function CheckpointRow({
  checkpoint,
  progress,
  onStart,
}: {
  checkpoint: Checkpoint;
  progress: ProgressState;
  onStart: () => void;
}) {
  const { done, total } = checkpointProgress(checkpoint, progress.completed);
  const best = progress.challenges[checkpoint.id]?.score;
  const passed = best !== undefined && best >= PASS_MARK;
  return (
    <li className="bg-card flex flex-wrap items-center gap-3 rounded-xl border p-4">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          passed
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        {passed ? (
          <CheckCircle2 className="size-5" aria-label="Passed" />
        ) : (
          <Target className="size-5" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{checkpoint.unit}</p>
        <p className="text-muted-foreground text-sm">
          Days {checkpoint.firstDay}–{checkpoint.lastDay} · {done} of {total}{" "}
          lessons done
        </p>
      </div>
      {best !== undefined && (
        <Badge variant={passed ? "default" : "secondary"}>Best {best}%</Badge>
      )}
      <Button
        size="sm"
        variant={passed ? "outline" : "default"}
        onClick={onStart}
      >
        {best === undefined ? "Take checkpoint" : "Retake"}
      </Button>
    </li>
  );
}

function AchievementTile({ achievement }: { achievement: Achievement }) {
  const earned = isEarned(achievement);
  const shown = Math.min(achievement.value, achievement.target);
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3",
        earned
          ? "border-amber-500/30 bg-amber-500/5"
          : "bg-card text-muted-foreground",
      )}
    >
      <Award
        className={cn(
          "mt-0.5 size-5 shrink-0",
          earned ? "text-amber-500" : "opacity-50",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("text-sm font-medium", earned && "text-foreground")}>
          {achievement.title}
          <span className="sr-only">{earned ? ", earned" : ", locked"}</span>
        </p>
        <p className="text-xs">{achievement.description}</p>
        {!earned && (
          <div
            className="bg-muted h-1.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-label={`${achievement.title} progress`}
            aria-valuemin={0}
            aria-valuemax={achievement.target}
            aria-valuenow={shown}
          >
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${(shown / achievement.target) * 100}%` }}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function CheckpointRun({
  checkpoint,
  onExit,
}: {
  checkpoint: Checkpoint;
  onExit: () => void;
}) {
  const [attempt, setAttempt] = useState(() => Date.now() % 100_000);
  const [score, setScore] = useState<QuizScore | null>(null);
  const [exercises, setExercises] = useState(() =>
    buildCheckpointQuiz(checkpoint, attempt),
  );

  function retry() {
    const next = attempt + 1;
    setAttempt(next);
    setExercises(buildCheckpointQuiz(checkpoint, next));
    setScore(null);
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onExit}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All challenges
      </button>
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
          Checkpoint · Days {checkpoint.firstDay}–{checkpoint.lastDay}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {checkpoint.unit}
        </h2>
      </header>

      {score ? (
        <Card>
          <CardContent className="space-y-5 py-4 text-center">
            <Trophy
              className={cn(
                "mx-auto size-10",
                score.percent >= PASS_MARK
                  ? "text-amber-500"
                  : "text-muted-foreground",
              )}
              aria-hidden
            />
            <div>
              <p className="text-4xl font-semibold tabular-nums">
                {score.percent}%
              </p>
              <p className="text-muted-foreground text-sm">
                {score.correct} of {score.total} correct ·{" "}
                {score.percent >= PASS_MARK
                  ? "Checkpoint passed"
                  : `${PASS_MARK}% passes the checkpoint`}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={retry}>
                <RotateCcw aria-hidden />
                Try a new set
              </Button>
              <Button onClick={onExit}>Back to challenges</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ExerciseRunner
          key={attempt}
          exercises={exercises}
          label={`${checkpoint.unit} checkpoint`}
          finishLabel="See my score"
          onFinish={(results) => {
            const result = scoreResults(results);
            progressActions.completeChallenge(checkpoint.id, result.percent);
            if (result.percent >= PASS_MARK) {
              toast.success(`Checkpoint passed: ${checkpoint.unit}`);
            }
            setScore(result);
          }}
        />
      )}
    </div>
  );
}

export function ChallengesClient() {
  const progress = useProgress();
  const [active, setActive] = useState<Checkpoint | null>(null);

  if (!progress) return <ChallengesSkeleton />;
  if (active) {
    return <CheckpointRun checkpoint={active} onExit={() => setActive(null)} />;
  }

  const badges = achievements(progress);
  const earned = badges.filter(isEarned).length;
  const doneDays = completedCourseDays(progress.completed);
  const missionsDone = SCENARIOS.filter(
    (s) => progress.challenges[missionId(s.id)],
  ).length;

  return (
    <div className="space-y-10">
      <Card className="via-card to-card bg-gradient-to-br from-amber-500/10">
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-amber-500/15 text-amber-500">
            <Trophy className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-semibold tabular-nums">
              {earned}
              <span className="text-muted-foreground text-sm font-normal">
                {" "}
                / {badges.length} badges
              </span>
            </p>
            <p className="text-muted-foreground text-sm">
              {missionsDone} of {SCENARIOS.length} speaking missions done.
              Fluency comes from speaking, so try one today.
            </p>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="missions" className="space-y-4">
        <SectionHeading
          id="missions"
          icon={<Mic className="size-5 text-violet-500" aria-hidden />}
          title="Speaking missions"
          description="Real-life role-plays with your tutor. Hit every goal, then mark the mission done."
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {MISSIONS.map((scenario) => (
            <MissionCard
              key={scenario.id}
              scenario={scenario}
              done={Boolean(progress.challenges[missionId(scenario.id)])}
              ready={doneDays.has(scenario.afterDay)}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="checkpoints" className="space-y-4">
        <SectionHeading
          id="checkpoints"
          icon={<Target className="size-5 text-emerald-500" aria-hidden />}
          title="Unit checkpoints"
          description={`A mixed quiz across a whole unit. Score ${PASS_MARK}% to pass; every attempt draws new words.`}
        />
        <ul className="space-y-2">
          {CHECKPOINTS.map((checkpoint) => (
            <CheckpointRow
              key={checkpoint.id}
              checkpoint={checkpoint}
              progress={progress}
              onStart={() => {
                setActive(checkpoint);
                window.scrollTo({ top: 0 });
              }}
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="badges" className="space-y-4">
        <SectionHeading
          id="badges"
          icon={<Award className="size-5 text-amber-500" aria-hidden />}
          title="Badges"
          description="Milestones on the way to fluency."
        />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((a) => (
            <AchievementTile key={a.id} achievement={a} />
          ))}
        </ul>
      </section>
    </div>
  );
}
