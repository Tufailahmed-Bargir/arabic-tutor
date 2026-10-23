import type { Metadata } from "next";
import { PhrasebookClient } from "@/features/phrasebook/phrasebook-client";

export const metadata: Metadata = {
  title: "Phrasebook",
  description:
    "Ready-to-use Arabic sentences for restaurants, shopping, travel, health, work and small talk, with audio.",
  robots: { index: false, follow: false },
};

export default function PhrasesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Phrasebook
        </h1>
        <p className="text-muted-foreground text-sm">
          Whole sentences for real situations. Listen, repeat out loud, then use
          them with your tutor.
        </p>
      </header>
      <PhrasebookClient />
    </div>
  );
}
