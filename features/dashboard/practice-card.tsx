import Link from "next/link";
import { ArrowRight, Check, Dumbbell } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  isPracticeComplete,
  todayPractice,
} from "@/features/progress/use-progress";
import type { ProgressState } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function PracticeCard({
  progress,
  today,
}: {
  progress: ProgressState;
  today: string;
}) {
  const day = todayPractice(progress, today);
  const complete = isPracticeComplete(day);
  const steps = [
    { label: "Review", done: day.reviewDone },
    { label: "Speak", done: day.speakDone },
    { label: "Talk", done: day.talkDone },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="via-card to-card bg-gradient-to-br from-sky-500/10">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-500/10 text-sky-500">
            <Dumbbell className="size-5" aria-hidden />
          </span>
          <div className="space-y-2">
            <div>
              <h2 className="font-semibold tracking-tight">
                {complete ? "Today’s practice is done" : "Today’s practice"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {complete
                  ? "Nice work. Your streak is safe until tomorrow."
                  : doneCount === 0
                    ? "Ten minutes: review, speak out loud, then talk with your tutor."
                    : `${doneCount} of 3 steps done.`}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Practice steps">
              {steps.map((step) => (
                <li
                  key={step.label}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    step.done
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "text-muted-foreground",
                  )}
                >
                  {step.done && <Check className="size-3" aria-hidden />}
                  {step.label}
                  <span className="sr-only">
                    {step.done ? " done" : " to do"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          href="/practice"
          className={cn(
            buttonVariants({
              size: "lg",
              variant: complete ? "outline" : "default",
            }),
            "w-full sm:w-auto",
          )}
        >
          {complete
            ? "Practise more"
            : doneCount === 0
              ? "Start today’s practice"
              : "Continue practice"}
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
