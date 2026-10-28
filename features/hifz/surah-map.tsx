"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";
import { surahStrengths, type AyahStrength } from "./progress";
import type { SurahMeta } from "./types";

const STRENGTH: Record<AyahStrength, { label: string; className: string }> = {
  memorised: {
    label: "Memorised",
    className: "bg-emerald-500 text-white dark:bg-emerald-500/80",
  },
  learning: {
    label: "Learning",
    className: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
  },
  weak: {
    label: "Weak",
    className: "bg-amber-500/25 text-amber-800 dark:text-amber-300",
  },
  new: { label: "Not recited", className: "bg-muted text-muted-foreground" },
};
const ORDER: AyahStrength[] = ["memorised", "learning", "weak", "new"];

interface SurahMapProps {
  surah: SurahMeta;
  /** Selects a single ayah to recite. */
  onPick?: (ayah: number) => void;
}

/** One chip per ayah, coloured by how well it is memorised. */
export function SurahMap({ surah, onPick }: SurahMapProps) {
  const progress = useProgress();

  if (!progress) {
    return (
      <div className="space-y-2" aria-hidden>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const strengths = surahStrengths(progress.hifz, surah.id, surah.ayahs);
  const counts = Object.fromEntries(
    ORDER.map((s) => [s, strengths.filter((x) => x === s).length]),
  ) as Record<AyahStrength, number>;

  return (
    <section aria-labelledby="hifz-map-title" className="space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="hifz-map-title" className="text-sm font-medium">
          {surah.name}{" "}
          <span className="text-muted-foreground">· {surah.meaning}</span>
        </h2>
        <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {ORDER.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <span
                className={cn("size-2.5 rounded-sm", STRENGTH[s].className)}
                aria-hidden
              />
              {STRENGTH[s].label} {counts[s]}
            </li>
          ))}
        </ul>
      </div>
      {counts.new === surah.ayahs && (
        <p className="text-muted-foreground text-xs">
          No ayat recited yet. Your progress for each ayah will show here.
        </p>
      )}
      <ol className="flex max-h-48 flex-wrap gap-1 overflow-y-auto">
        {strengths.map((strength, i) => {
          const ayah = i + 1;
          const label = `Ayah ${ayah}: ${STRENGTH[strength].label}`;
          return (
            <li key={ayah}>
              <button
                type="button"
                onClick={onPick ? () => onPick(ayah) : undefined}
                disabled={!onPick}
                aria-label={`${label}. Recite only this ayah.`}
                title={label}
                className={cn(
                  "focus-visible:ring-ring/50 grid h-7 min-w-7 place-items-center rounded-md px-1 text-[11px] font-medium tabular-nums transition-opacity outline-none hover:opacity-80 focus-visible:ring-3 disabled:cursor-default",
                  STRENGTH[strength].className,
                )}
              >
                {ayah}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
