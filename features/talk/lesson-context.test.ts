import { describe, expect, test } from "bun:test";
import { getWord } from "@/features/curriculum/lessons";
import { buildTalkContext, defaultTopicId, listTopics } from "./lesson-context";
import { SCENARIOS } from "./scenarios";

const done = (day: number, when: string) => ({
  [String(day)]: { completedAt: when, score: 90 },
});

describe("talk context", () => {
  test("every scenario word exists in the curriculum", () => {
    for (const s of SCENARIOS) {
      for (const id of s.wordIds) expect(getWord(id)).toBeDefined();
    }
  });

  test("always sends the four variables the agent prompt needs", () => {
    const topics = [
      null,
      "lesson-5",
      ...SCENARIOS.map((s) => `scenario-${s.id}`),
    ];
    for (const topic of topics) {
      const vars = buildTalkContext({}, topic).dynamicVariables;
      expect(Object.keys(vars).sort()).toEqual([
        "grammar_point",
        "lesson_title",
        "lesson_vocab",
        "level",
      ]);
      for (const value of Object.values(vars)) {
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test("defaults to Day 1 for a new learner", () => {
    expect(defaultTopicId({})).toBe("lesson-1");
  });

  test("defaults to the most recently completed lesson", () => {
    const completed = {
      ...done(1, "2026-10-20T08:00:00Z"),
      ...done(2, "2026-10-22T08:00:00Z"),
      ...done(3, "2026-10-21T08:00:00Z"),
    };
    expect(defaultTopicId(completed)).toBe("lesson-2");
    expect(
      buildTalkContext(completed, null).dynamicVariables.lesson_title,
    ).toContain("Day 2");
  });

  test("offers reached lessons plus all role-plays", () => {
    const { lessons, scenarios } = listTopics(done(1, "2026-10-20T08:00:00Z"));
    expect(lessons.map((l) => l.id)).toEqual(["lesson-1", "lesson-2"]);
    expect(scenarios).toHaveLength(SCENARIOS.length);
  });

  test("falls back to Day 1 for an unknown topic", () => {
    expect(buildTalkContext({}, "lesson-999").badge).toBe("Day 1");
  });
});
