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
  const ARABIC_SCRIPT = /[؀-ۿ]/;
  const quizzes = SEEDS.flatMap((seed) => buildPictureQuiz(pool, seed, 30));

  test("there are plenty of pictured words to quiz on", () => {
    expect(pool.length).toBeGreaterThan(50);
  });

  test("a quiz uses all three Arabic-first question styles", () => {
    const variants = new Set(
      buildPictureQuiz(pool, 1, 30).map((c) => c.variant),
    );
    expect(variants).toEqual(new Set(["image-ar", "ar-image", "listen-image"]));
  });

  // The learner is studying Arabic: English must never be the thing they read or choose.
  test("no English appears in any prompt or option", () => {
    for (const c of quizzes) {
      expect(c.promptText).toBeUndefined();
      for (const o of c.options) {
        const arabicLabel = o.arabic && ARABIC_SCRIPT.test(o.label);
        expect(arabicLabel || /^Picture \d$/.test(o.label)).toBe(true);
      }
      if (c.variant === "ar-image") {
        expect(c.promptAr).toBe(getWord(c.answerId)!.ar);
      }
    }
  });

  test("every option is distinct, unambiguous and has a photo behind it", () => {
    for (const c of quizzes) {
      expect(c.options.filter((o) => o.id === c.answerId)).toHaveLength(1);
      expect(c.options).toHaveLength(4);

      const options = c.options.map((o) => getWord(o.id)!);
      expect(new Set(options.map((w) => w.en.toLowerCase())).size).toBe(4);
      expect(new Set(options.map((w) => w.ar)).size).toBe(4);
      const sources = options.map((w) => getWordImage(w.id)!.src);
      expect(new Set(sources).size).toBe(4);

      if (c.variant === "image-ar") {
        expect(c.promptImage).toBeDefined();
        expect(c.options.every((o) => !o.image)).toBe(true);
      } else {
        expect(c.options.every((o) => o.image)).toBe(true);
      }
    }
  });

  test("the photo-to-Arabic question never speaks its own answer", () => {
    for (const c of quizzes.filter((q) => q.variant === "image-ar")) {
      expect(c.audio).toBeUndefined();
    }
    for (const c of quizzes.filter((q) => q.variant !== "image-ar")) {
      expect(c.audio).toBe(getWord(c.answerId)!.ar);
    }
  });

  test("look-alike photos never share a question", () => {
    const together = (a: string, b: string) =>
      quizzes.some((c) => {
        const ens = c.options.map((o) => getWord(o.id)!.en);
        return ens.includes(a) && ens.includes(b);
      });
    expect(together("star", "night")).toBe(false);
    expect(together("moon", "crescent")).toBe(false);
    expect(together("apples", "an apple")).toBe(false);
  });

  test("a quiz asks about each word at most once", () => {
    const ids = buildPictureQuiz(pool, 7, 10).map((c) => c.answerId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(10);
  });

  test("duplicate words and photos from different lessons are asked only once", () => {
    for (const seed of SEEDS) {
      const answers = buildPictureQuiz(pool, seed, 40).map((c) =>
        getWord(c.answerId)!,
      );
      const sources = answers.map((w) => getWordImage(w.id)!.src);
      const meanings = answers.map((w) => w.en.toLowerCase());
      expect(new Set(sources).size).toBe(sources.length);
      expect(new Set(meanings).size).toBe(meanings.length);
    }
  });

  test("lesson quizzes include Arabic photo questions where the lesson has photos", () => {
    const lesson = LESSONS.find((l) => pictureWords(l.words).length > 0)!;
    const picture = buildQuiz(lesson, 1)
      .filter((e): e is ChoiceExercise => e.kind === "choice")
      .filter((e) => e.variant === "image-ar" || e.variant === "ar-image");
    expect(picture.length).toBeGreaterThan(0);
    for (const c of picture) {
      expect(c.promptText).toBeUndefined();
    }
  });
});
