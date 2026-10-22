import type { Metadata } from "next";
import { PracticeClient } from "@/features/practice/practice-client";

export const metadata: Metadata = {
  title: "Daily practice",
  description: "Review, speak and talk: your daily Arabic practice.",
  robots: { index: false, follow: false },
};

export default function PracticePage() {
  return <PracticeClient />;
}
