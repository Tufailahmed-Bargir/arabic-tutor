import { addDays } from "@/lib/date";
import { cn } from "@/lib/utils";

const WEEKS = 12;

const LEVELS = [
  "bg-muted",
  "bg-emerald-500/25",
  "bg-emerald-500/50",
  "bg-emerald-500/75",
  "bg-emerald-500",
] as const;

function level(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function buildDays(today: string): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  const start = addDays(today, -(weekday + (WEEKS - 1) * 7));
  return Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
}

interface ActivityHeatmapProps {
  activity: Record<string, number>;
  today: string;
}

export function ActivityHeatmap({ activity, today }: ActivityHeatmapProps) {
  const days = buildDays(today);
  const total = days.reduce((sum, day) => sum + (activity[day] ?? 0), 0);

  return (
    <figure className="space-y-3">
      <div
        role="img"
        aria-label={`${total} learning activities in the last ${WEEKS} weeks`}
        className="grid grid-flow-col grid-cols-12 grid-rows-7 gap-1 sm:gap-1.5"
      >
        {days.map((day) => {
          const count = activity[day] ?? 0;
          const future = day > today;
          return (
            <div
              key={day}
              title={
                future
                  ? undefined
                  : `${day}: ${count} ${count === 1 ? "activity" : "activities"}`
              }
              className={cn(
                "aspect-square w-full rounded-[3px]",
                future ? "invisible" : LEVELS[level(count)],
                day === today && "ring-foreground/40 ring-1",
              )}
            />
          );
        })}
      </div>
      <figcaption className="text-muted-foreground flex items-center justify-between text-xs">
        <span>{total} activities in 12 weeks</span>
        <span className="flex items-center gap-1" aria-hidden>
          Less
          {LEVELS.map((cls) => (
            <span key={cls} className={cn("size-2.5 rounded-[2px]", cls)} />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  );
}
