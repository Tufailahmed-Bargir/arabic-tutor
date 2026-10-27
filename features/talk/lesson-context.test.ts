import { describe, expect, test } from "bun:test";
import { LESSONS, getWord } from "@/features/curriculum/lessons";
import { buildTalkContext, defaultTopicId, listTopics } from "./lesson-context";
import { SCENARIOS } from "./scenarios";

const FIRST = LESSONS[0]!.day;
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
      `lesson-${FIRST + 4}`,
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

  test("defaults to the first course lesson for a new learner", () => {
    expect(defaultTopicId({})).toBe(`lesson-${FIRST}`);
  });

  test("defaults to the most recently completed lesson", () => {
    const completed = {
      ...done(FIRST, "2026-10-20T08:00:00Z"),
      ...done(FIRST + 1, "2026-10-22T08:00:00Z"),
      ...done(FIRST + 2, "2026-10-21T08:00:00Z"),
    };
    expect(defaultTopicId(completed)).toBe(`lesson-${FIRST + 1}`);
    expect(
      buildTalkContext(completed, null).dynamicVariables.lesson_title,
    ).toContain(`Day ${FIRST + 1}`);
  });

  test("offers reached lessons plus all role-plays", () => {
    const { lessons, scenarios } = listTopics(
      done(FIRST, "2026-10-20T08:00:00Z"),
    );
    expect(lessons.map((l) => l.id)).toEqual([
      `lesson-${FIRST}`,
      `lesson-${FIRST + 1}`,
    ]);
    expect(scenarios).toHaveLength(SCENARIOS.length);
  });

  test("falls back to the first course lesson for an unknown topic", () => {
    expect(buildTalkContext({}, "lesson-999").badge).toBe(`Day ${FIRST}`);
    expect(buildTalkContext({}, "lesson-1").badge).toBe(`Day ${FIRST}`);
  });
});
