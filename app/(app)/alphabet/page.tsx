import type { Metadata } from "next";
import { AlphabetClient } from "@/features/alphabet/alphabet-client";

export const metadata: Metadata = {
  title: "Alphabet",
  description:
    "The 28 Arabic letters with their four forms, sounds and vowel marks.",
  robots: { index: false, follow: false },
};

export default function AlphabetPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          The Arabic alphabet
        </h1>
        <p className="text-muted-foreground text-sm">
          28 letters, read right to left. Tap a letter to see how it changes
          shape inside a word.
        </p>
      </header>
      <AlphabetClient />
    </div>
  );
}
