import { describe, expect, test } from "bun:test";
import { getWordImage } from "@/features/curriculum/images";
import { ALL_LESSONS, LESSONS, getWord } from "@/features/curriculum/lessons";
import {
  acceptedAnswers,
  buildListenRound,
  buildPictureQuiz,
  buildQuiz,
  isTypingCorrect,
  pictureWords,
  type ChoiceExercise,
} from "./exercises";

const SEEDS = Array.from({ length: 25 }, (_, i) => i + 1);

function choicesOf(exercises: readonly { kind: string }[]) {
  return exercises.filter((e): e is ChoiceExercise => e.kind === "choice");
}

describe("quiz generation", () => {
  for (const lesson of LESSONS) {
    test(`day ${lesson.day}: choices have one unambiguous correct option`, () => {
      for (const seed of SEEDS) {
        const choices = [
          ...choicesOf(buildQuiz(lesson, seed)),
          ...buildListenRound(lesson, seed),
        ];
        for (const c of choices) {
          const labels = c.options.map((o) => o.label);
          expect(new Set(labels).size).toBe(labels.length);
          expect(new Set(c.options.map((o) => o.id)).size).toBe(
            c.options.length,
          );
          expect(c.options.filter((o) => o.id === c.answerId)).toHaveLength(1);
          expect(c.options.length).toBeGreaterThanOrEqual(3);
        }
      }
    });

    test(`day ${lesson.day}: match and typing exercises are well formed`, () => {
      for (const seed of SEEDS) {
        const quiz = buildQuiz(lesson, seed);
        for (const e of quiz) {
          if (e.kind === "match") {
            expect(new Set(e.pairs.map((p) => p.en)).size).toBe(e.pairs.length);
            expect(new Set(e.pairs.map((p) => p.ar)).size).toBe(e.pairs.length);
          }
          if (e.kind === "typing") {
            expect(e.answers.length).toBeGreaterThan(0);
            expect(e.answers.every((a) => a.length > 0)).toBe(true);
            const gloss = e.reveal.en.replace(/\s*\([^)]*\)/g, "").trim();
            expect(gloss.split(/\s+/).length).toBeLessThanOrEqual(3);
          }
        }
      }
    });
  }
});

describe("typing answers", () => {
  const cases: Array<[gloss: string, typed: string]> = [
    ["one (١)", "one"],
    ["you (masculine)", "you"],
    ["tall / long", "tall"],
    ["tall / long", "long"],
    ["he wrote", "wrote"],
    ["he wrote", "he wrote"],
    ["please, go ahead / here you are", "please"],
    ["I", "i"],
    ["apples", "Apples"],
  ];
  for (const [gloss, typed] of cases) {
    test(`"${typed}" is accepted for "${gloss}"`, () => {
      expect(isTypingCorrect(typed, acceptedAnswers(gloss))).toBe(true);
    });
  }

  test("every word has at least one typable answer", () => {
    for (const lesson of LESSONS) {
      for (const w of lesson.words) {
        expect(acceptedAnswers(w.en).length).toBeGreaterThan(0);
      }
    }
  });

  test("wrong answers are rejected", () => {
    expect(isTypingCorrect("cat", acceptedAnswers("house"))).toBe(false);
    expect(isTypingCorrect("", acceptedAnswers("house"))).toBe(false);
  });
});

describe("picture quizzes", () => {
  const pool = pictureWords(ALL_LESSONS.flatMap((l) => l.words));

  test("there are plenty of pictured words to quiz on", () => {
    expect(pool.length).toBeGreaterThan(50);
  });

  test("every option is distinct, unambiguous and has a photo behind it", () => {
    for (const seed of SEEDS) {
      for (const c of buildPictureQuiz(pool, seed, 30)) {
        const answer = getWord(c.answerId)!;
        expect(c.options.filter((o) => o.id === c.answerId)).toHaveLength(1);
        expect(c.options).toHaveLength(4);

        const options = c.options.map((o) => getWord(o.id)!);
        // Different words, different meanings, different photos.
        expect(new Set(options.map((w) => w.en.toLowerCase())).size).toBe(4);
        const sources = options.map((w) => getWordImage(w.id)!.src);
        expect(new Set(sources).size).toBe(4);
        if (c.variant === "image-ar") {
          expect(new Set(options.map((w) => w.ar)).size).toBe(4);
        }

        if (c.variant === "en-image") {
          expect(c.options.every((o) => o.image)).toBe(true);
          expect(c.promptText).toBe(answer.en);
        } else {
          expect(c.promptImage).toBeDefined();
          expect(c.options.every((o) => !o.image)).toBe(true);
        }
      }
    }
  });

  test("labels and alt text never give the answer away", () => {
    for (const c of buildPictureQuiz(pool, 3, 30)) {
      if (c.variant !== "en-image") continue;
      for (const o of c.options) {
        expect(o.label).toMatch(/^Picture \d$/);
      }
    }
  });

  test("look-alike photos never share a question", () => {
    const together = (a: string, b: string) =>
      SEEDS.some((seed) =>
        buildPictureQuiz(pool, seed, 40).some((c) => {
          const ens = c.options.map((o) => getWord(o.id)!.en);
          return ens.includes(a) && ens.includes(b);
        }),
      );
    expect(together("star", "night")).toBe(false);
    expect(together("moon", "crescent")).toBe(false);
    expect(together("apples", "an apple")).toBe(false);
  });

  test("a quiz asks about each word at most once", () => {
    const ids = buildPictureQuiz(pool, 7, 10).map((c) => c.answerId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(10);
  });

  test("lesson quizzes include photo questions where the lesson has photos", () => {
    const lesson = LESSONS.find((l) => pictureWords(l.words).length > 0)!;
    const kinds = buildQuiz(lesson, 1)
      .filter((e): e is ChoiceExercise => e.kind === "choice")
      .map((e) => e.variant);
    expect(kinds.some((v) => v === "image-en" || v === "en-image")).toBe(true);
  });
});
