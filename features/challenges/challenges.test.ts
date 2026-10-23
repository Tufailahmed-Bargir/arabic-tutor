import { describe, expect, test } from "bun:test";
import { LESSONS } from "@/features/curriculum/lessons";
import { createInitialState } from "@/lib/storage";
import {
  CHECKPOINTS,
  PASS_MARK,
  achievements,
  buildCheckpointQuiz,
  checkpointProgress,
  isEarned,
  missionId,
} from "./challenges";

describe("checkpoints", () => {
  test("one per unit, covering every lesson once", () => {
    const units = new Set(LESSONS.map((l) => l.unit));
    expect(CHECKPOINTS).toHaveLength(units.size);
    const covered = CHECKPOINTS.flatMap((c) =>
      Array.from(
        { length: c.lastDay - c.firstDay + 1 },
        (_, i) => c.firstDay + i,
      ),
    );
    expect(covered).toEqual(LESSONS.map((l) => l.day));
    expect(new Set(CHECKPOINTS.map((c) => c.id)).size).toBe(CHECKPOINTS.length);
  });

  test("quizzes are well formed for every unit", () => {
    for (const checkpoint of CHECKPOINTS) {
      for (const seed of [1, 2, 3, 42]) {
        const quiz = buildCheckpointQuiz(checkpoint, seed);
        expect(quiz.length).toBeGreaterThanOrEqual(8);
        expect(new Set(quiz.map((e) => e.id)).size).toBe(quiz.length);
        for (const e of quiz) {
          if (e.kind !== "choice") continue;
          expect(e.options.filter((o) => o.id === e.answerId)).toHaveLength(1);
          expect(new Set(e.options.map((o) => o.label)).size).toBe(
            e.options.length,
          );
        }
      }
    }
  });

  test("progress counts finished days in the unit", () => {
    const first = CHECKPOINTS[0]!;
    const completed = {
      [String(first.firstDay)]: { completedAt: "2026-10-23", score: 90 },
    };
    expect(checkpointProgress(first, completed).done).toBe(1);
  });
});

describe("achievements", () => {
  test("a new learner has earned nothing", () => {
    expect(achievements(createInitialState()).filter(isEarned)).toEqual([]);
  });

  test("passing a checkpoint and a mission earns their badges", () => {
    const s = createInitialState();
    s.challenges[CHECKPOINTS[0]!.id] = { completedAt: "x", score: PASS_MARK };
    s.challenges[missionId("cafe")] = { completedAt: "x", score: 100 };
    s.completed["1"] = { completedAt: "x", score: 80 };
    const earned = achievements(s)
      .filter(isEarned)
      .map((a) => a.id);
    expect(earned).toContain("checkpoint-1");
    expect(earned).toContain("first-lesson");
    expect(earned).not.toContain("missions-3");
  });

  test("a failed checkpoint does not count", () => {
    const s = createInitialState();
    s.challenges[CHECKPOINTS[0]!.id] = {
      completedAt: "x",
      score: PASS_MARK - 1,
    };
    expect(achievements(s).find((a) => a.id === "checkpoint-1")?.value).toBe(0);
  });
});
