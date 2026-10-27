import { LETTERS } from "./alphabet";
import type { Lesson, Word } from "./types";

export type Row = readonly [ar: string, tr: string, en: string];

export function words(day: number, rows: readonly Row[]): Word[] {
  return rows.map(([ar, tr, en], i) => ({
    id: `d${day}w${i + 1}`,
    ar,
    tr,
    en,
  }));
}

export function alphabetLesson(
  day: number,
  title: string,
  titleAr: string,
  chars: string[],
): Lesson {
  const letters = LETTERS.filter((l) => chars.includes(l.char));
  return {
    day,
    unit: "The alphabet",
    title,
    titleAr,
    objective: `Recognise, say and write ${letters.map((l) => l.name).join(", ")}.`,
    grammar: {
      title: "Arabic reads right to left",
      body: "Letters change shape depending on where they sit in a word: alone, at the start, in the middle or at the end. Six letters (ا د ذ ر ز و) never join to the letter after them.",
    },
    words: words(
      day,
      letters.map((l) => [l.example.ar, l.example.tr, l.example.en] as const),
    ),
  };
}
