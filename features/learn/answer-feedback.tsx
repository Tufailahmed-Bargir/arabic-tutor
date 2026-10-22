import { CheckCircle2, XCircle } from "lucide-react";

import { ArabicText } from "@/components/arabic-text";
import { cn } from "@/lib/utils";
import type { Reveal } from "./exercises";

interface AnswerFeedbackProps {
  /** null while the learner has not answered yet. */
  correct: boolean | null;
  reveal: Reveal;
  className?: string;
}

/** Polite live region: announces the result, then shows the answer card. */
export function AnswerFeedback({
  correct,
  reveal,
  className,
}: AnswerFeedbackProps) {
  return (
    <div aria-live="polite" className={cn("min-h-[5.5rem]", className)}>
      {correct !== null && (
        <div
          className={cn(
            "animate-in fade-in-0 slide-in-from-bottom-1 flex items-center gap-3 rounded-xl border p-3 duration-200",
            correct
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-rose-500/30 bg-rose-500/10",
          )}
        >
          {correct ? (
            <CheckCircle2
              className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
          ) : (
            <XCircle
              className="size-5 shrink-0 text-rose-600 dark:text-rose-400"
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {correct ? "Correct" : "Not quite. The answer is:"}
            </p>
            <p className="text-muted-foreground flex flex-wrap items-baseline gap-x-3 text-sm">
              <ArabicText text={reveal.ar} size="lg" />
              <span>{reveal.tr}</span>
              <span aria-hidden>·</span>
              <span>{reveal.en}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
