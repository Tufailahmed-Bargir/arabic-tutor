import { describe, expect, test } from "bun:test";
import { buildTalkContext } from "@/features/talk/lesson-context";
import { tutorVariablesSchema } from "@/features/talk/tutor-prompt";
import { LESSONS, getWord } from "./lessons";

describe("curriculum", () => {
  // Review cards and completed lessons are stored by these ids, so they must never move.
  test("the original 24 lessons keep their word ids", () => {
    const original = LESSONS.filter((l) => l.day <= 24).map((l) => ({
      day: l.day,
      words: l.words.map((w) => `${w.id} ${w.ar}`),
    }));
    expect(original).toMatchSnapshot();
  });

  test("days run 1..N with no gaps or repeats", () => {
    expect(LESSONS.map((l) => l.day)).toEqual(LESSONS.map((_, i) => i + 1));
  });

  test("word ids are unique and resolve", () => {
    const ids = LESSONS.flatMap((l) => l.words.map((w) => w.id));
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

  test("every lesson fits the tutor's variable limits", () => {
    for (const lesson of LESSONS) {
      const vars = buildTalkContext(
        {},
        `lesson-${lesson.day}`,
      ).dynamicVariables;
      expect(tutorVariablesSchema.safeParse(vars).success).toBe(true);
    }
  });
});
