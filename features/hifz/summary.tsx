import { MicOff, RotateCcw, SkipForward, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HifzSummary } from "./session";

interface SummaryProps {
  summary: HifzSummary;
  onRetryFromMistake: (() => void) | null;
  onRetry: () => void;
  onChangePassage: () => void;
}

export function Summary({
  summary,
  onRetryFromMistake,
  onRetry,
  onChangePassage,
}: SummaryProps) {
  const reached = summary.correct + summary.wrong + summary.skipped;

  if (reached === 0) {
    return (
      <section
        aria-labelledby="hifz-summary-title"
        className="bg-card flex flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-sm"
      >
        <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-full">
          <MicOff className="size-5" aria-hidden />
        </span>
        <h2 id="hifz-summary-title" className="text-lg font-semibold">
          Nothing was recognised
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Recite a little louder and closer to the microphone, starting from the
          first ayah of the passage.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={onRetry}>
            <RotateCcw aria-hidden /> Try again
          </Button>
          <Button type="button" variant="outline" onClick={onChangePassage}>
            Change passage
          </Button>
        </div>
      </section>
    );
  }

  const stats = [
    {
      label: "Correct",
      value: summary.correct,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Wrong",
      value: summary.wrong,
      className: "text-red-600 dark:text-red-400",
    },
    {
      label: "Skipped",
      value: summary.skipped,
      className: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <section
      aria-labelledby="hifz-summary-title"
      className="bg-card animate-in fade-in slide-in-from-bottom-2 space-y-5 rounded-2xl border p-4 shadow-sm duration-300 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <h2 id="hifz-summary-title" className="text-muted-foreground text-sm">
            Accuracy
          </h2>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {summary.accuracy}%
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-2">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-muted-foreground text-xs">{s.label}</dt>
              <dd
                className={cn(
                  "text-lg font-semibold tabular-nums",
                  s.className,
                )}
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {summary.unreached > 0 && (
        <p className="text-muted-foreground text-sm">
          You stopped with {summary.unreached}{" "}
          {summary.unreached === 1 ? "word" : "words"} still to recite. They
          don’t count towards your accuracy.
        </p>
      )}

      {summary.mistakesByAyah.length === 0 ? (
        <p className="rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          No mistakes in what you recited.
        </p>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Mistakes by ayah</h3>
          <ul className="divide-y rounded-xl border">
            {summary.mistakesByAyah.map(({ ayah, mistakes }) => (
              <li key={ayah} className="flex gap-3 p-3">
                <span className="text-muted-foreground w-14 shrink-0 pt-2 text-xs">
                  Ayah {ayah}
                </span>
                <ul
                  className="flex flex-1 flex-wrap justify-end gap-2"
                  dir="rtl"
                >
                  {mistakes.map((m) => (
                    <li
                      key={m.word.id}
                      className={cn(
                        "rounded-lg px-2 py-1",
                        m.status === "wrong"
                          ? "bg-red-500/10"
                          : "bg-amber-500/15",
                      )}
                    >
                      <span
                        lang="ar"
                        className="font-quran text-xl leading-loose"
                      >
                        {m.word.uthmani}
                      </span>
                      <span
                        dir="ltr"
                        className="text-muted-foreground block text-start text-[11px]"
                      >
                        {m.status === "skipped" ? (
                          "Skipped"
                        ) : (
                          <>
                            Heard{" "}
                            <span
                              lang="ar"
                              dir="rtl"
                              className="font-arabic text-sm"
                            >
                              {m.heard}
                            </span>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {onRetryFromMistake && summary.firstMistake && (
          <Button type="button" onClick={onRetryFromMistake}>
            <SkipForward aria-hidden /> Retry from ayah{" "}
            {summary.firstMistake.ayah}
          </Button>
        )}
        <Button
          type="button"
          variant={summary.firstMistake ? "outline" : "default"}
          onClick={onRetry}
        >
          <RotateCcw aria-hidden /> Recite again
        </Button>
        <Button type="button" variant="ghost" onClick={onChangePassage}>
          <Undo2 aria-hidden /> Change passage
        </Button>
      </div>
    </section>
  );
}
