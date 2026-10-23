import { lessonSchema, type Lesson, type Word } from "./types";
import { ABOUT_YOU } from "./units/about-you";
import { FOUNDATIONS } from "./units/foundations";
import { GETTING_AROUND } from "./units/getting-around";
import { LIFE_AND_WORK } from "./units/life-and-work";
import { NUMBERS_AND_TIME } from "./units/numbers-and-time";
import { TOWARD_FLUENCY } from "./units/toward-fluency";
import { VERBS } from "./units/verbs";

// In day order. Word ids are positional and stored in learners' progress, so only append.
const RAW: Lesson[] = [
  ...FOUNDATIONS,
  ...ABOUT_YOU,
  ...NUMBERS_AND_TIME,
  ...VERBS,
  ...GETTING_AROUND,
  ...LIFE_AND_WORK,
  ...TOWARD_FLUENCY,
];

export const LESSONS: readonly Lesson[] = RAW.map((l) => lessonSchema.parse(l));

export const TOTAL_LESSONS = LESSONS.length;

export function getLesson(day: number): Lesson | undefined {
  return LESSONS.find((l) => l.day === day);
}

const WORD_INDEX = new Map<string, Word>(
  LESSONS.flatMap((l) => l.words.map((w) => [w.id, w] as const)),
);

export function getWord(id: string): Word | undefined {
  return WORD_INDEX.get(id);
}

export function nextLessonDay(completed: ReadonlySet<number>): number | null {
  return LESSONS.find((l) => !completed.has(l.day))?.day ?? null;
}
