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

/** Every lesson ever shipped, including the alphabet unit that the course now skips. */
export const ALL_LESSONS: readonly Lesson[] = RAW.map((l) =>
  lessonSchema.parse(l),
);

export const ALPHABET_UNIT = "The alphabet";

/** The course learners see. Days keep their numbers so saved progress and word ids stay valid. */
export const LESSONS: readonly Lesson[] = ALL_LESSONS.filter(
  (l) => l.unit !== ALPHABET_UNIT,
);

/** Lessons the course skips; their words still resolve and feed the picture quiz. */
export const ALPHABET_LESSONS: readonly Lesson[] = ALL_LESSONS.filter(
  (l) => l.unit === ALPHABET_UNIT,
);

export const TOTAL_LESSONS = LESSONS.length;

export function getLesson(day: number): Lesson | undefined {
  return LESSONS.find((l) => l.day === day);
}

const WORD_INDEX = new Map<string, Word>(
  ALL_LESSONS.flatMap((l) => l.words.map((w) => [w.id, w] as const)),
);

export function getWord(id: string): Word | undefined {
  return WORD_INDEX.get(id);
}

export function nextLessonDay(completed: ReadonlySet<number>): number | null {
  return LESSONS.find((l) => !completed.has(l.day))?.day ?? null;
}

/** Completed days that belong to the visible course, ignoring skipped alphabet days. */
export function completedCourseDays(
  completed: Readonly<Record<string, unknown>>,
): Set<number> {
  const days = new Set(LESSONS.map((l) => l.day));
  return new Set(
    Object.keys(completed)
      .map(Number)
      .filter((d) => days.has(d)),
  );
}
