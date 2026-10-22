interface ProgressRingProps {
  value: number;
  total: number;
  label: string;
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ value, total, label }: ProgressRingProps) {
  const ratio = total === 0 ? 0 : Math.min(1, value / total);

  return (
    <div
      role="img"
      aria-label={`${label}: ${value} of ${total}`}
      className="relative size-20 shrink-0"
    >
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="7"
          className="stroke-muted"
        />
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums">
        {Math.round(ratio * 100)}%
      </span>
    </div>
  );
}
