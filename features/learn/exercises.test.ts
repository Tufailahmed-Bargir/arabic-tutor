import { describe, expect, test } from "bun:test";
import { LESSONS } from "@/features/curriculum/lessons";
import {
  acceptedAnswers,
  buildListenRound,
  buildQuiz,
  isTypingCorrect,
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
