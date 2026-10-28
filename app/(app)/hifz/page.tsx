import type { Metadata } from "next";
import { Amiri_Quran } from "next/font/google";
import Link from "next/link";

import { HifzClient } from "@/features/hifz/hifz-client";

// Loaded here only, so other pages don't download the Quran font.
const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hifz checker",
  description:
    "Recite a surah from memory and see word by word what you recited correctly, what you missed and which ayat need more work.",
  robots: { index: false, follow: false },
};

export default function HifzPage() {
  return (
    <div
      className={`${amiriQuran.variable} mx-auto w-full max-w-3xl space-y-6`}
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hifz checker
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose a passage and recite it from memory. Words appear as you get
          them right; mistakes and skipped words are marked.
        </p>
      </header>
      <HifzClient />
      <footer className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
        <p>
          Quran text and word data from{" "}
          <a
            href="https://quran.com"
            className="underline underline-offset-4"
            rel="noopener noreferrer"
          >
            Quran.com
          </a>{" "}
          (Quran Foundation), shown in the Amiri Quran typeface.
        </p>
        <p>
          Recitation is heard by your browser’s built-in speech recognition. In
          Chrome and Edge the audio is sent to the browser maker’s speech
          service. It is a general Arabic recogniser rather than one trained on
          Quran recitation, so treat its marks as a guide.{" "}
          <Link href="/credits" className="underline underline-offset-4">
            Credits
          </Link>
        </p>
      </footer>
    </div>
  );
}
