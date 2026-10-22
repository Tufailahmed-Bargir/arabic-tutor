import { daysBetween } from "@/lib/date";
import type { ProgressState } from "@/lib/storage";

/** A streak is alive only if the last activity was today or yesterday. */
export function liveStreak(
  streak: ProgressState["streak"],
  today: string,
): number {
  if (!streak.lastDate) return 0;
  return daysBetween(streak.lastDate, today) <= 1 ? streak.current : 0;
}

export function greeting(hour: number): { en: string; ar: string } {
  if (hour < 12) return { en: "Good morning", ar: "صَبَاحُ الْخَيْرِ" };
  if (hour < 18) return { en: "Good afternoon", ar: "مَرْحَبًا" };
  return { en: "Good evening", ar: "مَسَاءُ الْخَيْرِ" };
}
