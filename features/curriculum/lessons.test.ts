import { describe, expect, test } from "bun:test";
import { buildTalkContext } from "@/features/talk/lesson-context";
import { SCENARIOS } from "@/features/talk/scenarios";
import { tutorVariablesSchema } from "@/features/talk/tutor-prompt";
import {
  ALL_LESSONS,
  ALPHABET_UNIT,
  LESSONS,
  completedCourseDays,
  getLesson,
  getWord,
} from "./lessons";

describe("curriculum", () => {
  // Review cards and completed lessons are stored by these ids, so they must never move.
  test("the original 24 lessons keep their word ids", () => {
    const original = ALL_LESSONS.filter((l) => l.day <= 24).map((l) => ({
      day: l.day,
      words: l.words.map((w) => `${w.id} ${w.ar}`),
    }));
    expect(original).toMatchSnapshot();
  });

  test("days run 1..N with no gaps or repeats", () => {
    expect(ALL_LESSONS.map((l) => l.day)).toEqual(
      ALL_LESSONS.map((_, i) => i + 1),
    );
  });

  test("the course skips the whole alphabet unit but keeps its words", () => {
    expect(LESSONS.some((l) => l.unit === ALPHABET_UNIT)).toBe(false);
    expect(LESSONS.length).toBeLessThan(ALL_LESSONS.length);
    expect(getLesson(1)).toBeUndefined();
    expect(getWord("d1w2")?.en).toBe("house");
  });

  test("only visible lessons count as completed", () => {
    const first = LESSONS[0]!.day;
    const done = completedCourseDays({
      "1": { completedAt: "x", score: 90 },
      "8": { completedAt: "x", score: 90 },
      [String(first)]: { completedAt: "x", score: 90 },
    });
    expect([...done]).toEqual([first]);
  });

  test("word ids are unique and resolve", () => {
    const ids = ALL_LESSONS.flatMap((l) => l.words.map((w) => w.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(getWord(id)).toBeDefined();
  });

  test("each unit is one contiguous block", () => {
    const seen = new Set<string>();
    let previous = "";
    for (const { unit } of LESSONS) {
      if (unit !== previous) {
        expect(seen.has(unit)).toBe(false);
        seen.add(unit);
        previous = unit;
      }
    }
  });

  // The backup tutor's token route rejects anything over these limits with a 400.
  test("every lesson and role-play fits the tutor's variable limits", () => {
    const topics = [
      ...LESSONS.map((l) => `lesson-${l.day}`),
      ...SCENARIOS.map((s) => `scenario-${s.id}`),
    ];
    for (const topic of topics) {
      const vars = buildTalkContext({}, topic).dynamicVariables;
      expect(tutorVariablesSchema.safeParse(vars).success).toBe(true);
    }
  });
});
