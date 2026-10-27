import type { Metadata } from "next";

import { LessonList } from "@/features/learn/lesson-list";

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "Your daily Arabic lessons, from the vowel marks to everyday conversation.",
  robots: { index: false, follow: false },
};

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        <p className="text-muted-foreground text-sm">
          One short lesson a day: learn, listen, then test yourself.
        </p>
      </header>
      <LessonList />
    </div>
  );
}
