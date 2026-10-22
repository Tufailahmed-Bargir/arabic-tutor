import { AudioLines, Loader2, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrbState =
  "idle" | "connecting" | "listening" | "speaking" | "muted";

const LABELS: Record<OrbState, string> = {
  idle: "Ready when you are",
  connecting: "Connecting to your tutor…",
  listening: "Listening — speak now",
  speaking: "Ustadh is speaking",
  muted: "Microphone muted",
};

export function orbLabel(state: OrbState): string {
  return LABELS[state];
}

export function MicOrb({ state }: { state: OrbState }) {
  const active = state === "listening" || state === "speaking";
  const Icon =
    state === "connecting"
      ? Loader2
      : state === "speaking"
        ? AudioLines
        : state === "muted"
          ? MicOff
          : Mic;

  return (
    <div
      className="relative flex size-40 items-center justify-center"
      aria-hidden="true"
    >
      {active && (
        <>
          <span
            className={cn(
              "bg-primary/10 absolute inset-0 rounded-full motion-safe:animate-ping",
              state === "speaking" && "bg-emerald-500/15",
            )}
          />
          <span className="bg-primary/10 absolute inset-4 rounded-full motion-safe:animate-pulse" />
        </>
      )}
      <span
        className={cn(
          "relative flex size-24 items-center justify-center rounded-full border shadow-sm transition-colors",
          state === "idle" && "bg-card text-muted-foreground",
          state === "connecting" && "bg-card text-muted-foreground",
          state === "listening" && "bg-primary text-primary-foreground",
          state === "speaking" &&
            "border-emerald-500/40 bg-emerald-600 text-white",
          state === "muted" && "bg-muted text-muted-foreground",
        )}
      >
        <Icon
          className={cn("size-9", state === "connecting" && "animate-spin")}
        />
      </span>
    </div>
  );
}
