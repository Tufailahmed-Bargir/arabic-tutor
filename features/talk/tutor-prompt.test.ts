import { describe, expect, test } from "bun:test";
import {
  tutorGreeting,
  tutorPrompt,
  tutorVariablesSchema,
} from "./tutor-prompt";

const vars = {
  lesson_title: "Day 2: Animals",
  level: "Absolute beginner",
  lesson_vocab: "أَسَد (asad) = lion",
  grammar_point: "No special grammar focus today",
};

describe("tutorPrompt", () => {
  test("fills every lesson variable", () => {
    const prompt = tutorPrompt(vars);
    expect(prompt).toContain("Today's lesson: Day 2: Animals");
    expect(prompt).toContain("أَسَد (asad) = lion");
    expect(prompt).not.toContain("{{");
  });

  test("greets with the lesson title", () => {
    expect(tutorGreeting(vars)).toContain("today's lesson: Day 2: Animals?");
  });
});

describe("tutorVariablesSchema", () => {
  test("rejects oversized input", () => {
    const result = tutorVariablesSchema.safeParse({
      ...vars,
      lesson_vocab: "x".repeat(5000),
    });
    expect(result.success).toBe(false);
  });

  test("rejects a missing title", () => {
    expect(
      tutorVariablesSchema.safeParse({ ...vars, lesson_title: undefined })
        .success,
    ).toBe(false);
  });
});
