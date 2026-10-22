import type { Metadata } from "next";
import { ReviewClient } from "@/features/review/review-client";

export const metadata: Metadata = {
  title: "Review",
  description:
    "Spaced-repetition flashcards for the Arabic words you have learned.",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="sr-only">Review flashcards</h1>
      <ReviewClient />
    </div>
  );
}
