import { LESSONS, nextLessonDay } from "@/features/curriculum/lessons";
import type { Lesson } from "@/features/curriculum/types";

export interface TalkContext {
  lesson: Lesson;
  level: string;
  dynamicVariables: {
    lesson_title: string;
    level: string;
    lesson_vocab: string;
    grammar_point: string;
  };
}

function levelFor(completedCount: number): string {
  if (completedCount < 8)
    return "Absolute beginner, still learning the letters and sounds";
  if (completedCount < 16)
    return "Beginner, can read letters and knows basic phrases";
  return "Advanced beginner, ready for short sentences";
}

export function buildTalkContext(
  completedDays: ReadonlySet<number>,
): TalkContext {
  const day = nextLessonDay(completedDays);
  const lesson =
    LESSONS.find((l) => l.day === day) ?? LESSONS[LESSONS.length - 1];
  const level = levelFor(completedDays.size);

  return {
    lesson,
    level,
    dynamicVariables: {
      lesson_title: `Day ${lesson.day}: ${lesson.title}`,
      level,
      lesson_vocab: lesson.words
        .map((w) => `${w.ar} (${w.tr}) = ${w.en}`)
        .join("; "),
      grammar_point: lesson.grammar
        ? `${lesson.grammar.title}: ${lesson.grammar.body}`
        : "No special grammar focus today",
    },
  };
}
