import type { Metadata } from "next";
import { ChallengesClient } from "@/features/challenges/challenges-client";

export const metadata: Metadata = {
  title: "Challenges",
  description:
    "Speaking missions, unit checkpoints and badges to push your Arabic further.",
  robots: { index: false, follow: false },
};

export default function ChallengesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Challenges
        </h1>
        <p className="text-muted-foreground text-sm">
          Test a whole unit, take on real-life speaking missions and collect
          badges along the way.
        </p>
      </header>
      <ChallengesClient />
    </div>
  );
}
