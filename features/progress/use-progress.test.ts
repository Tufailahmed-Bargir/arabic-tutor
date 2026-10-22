import { beforeEach, describe, expect, test } from "bun:test";
import { getProgress, progressActions, todayPractice } from "./use-progress";
import { toDateKey } from "@/lib/date";

// The store keeps module state and tolerates a missing localStorage, so it runs under bun test.
const today = toDateKey();

beforeEach(() => progressActions.reset());

describe("rateSpoken", () => {
  test("does not schedule a card twice when it was already reviewed today", () => {
    progressActions.completeLesson(1, 100);
    progressActions.rateCard("d1w1", 4);
    const afterReview = getProgress().cards.d1w1;
    expect(afterReview?.interval).toBe(1);

    progressActions.rateSpoken("d1w1", 4);

    expect(getProgress().cards.d1w1).toEqual(afterReview!);
    expect(todayPractice(getProgress(), today).spoken).toBe(1);
  });

  test("reschedules a card that is due", () => {
    progressActions.completeLesson(1, 100);
    const before = getProgress().cards.d1w2;
    progressActions.rateSpoken("d1w2", 4);
    expect(getProgress().cards.d1w2?.reps).toBe((before?.reps ?? 0) + 1);
  });

  test("never creates a card for a word that has not been studied", () => {
    progressActions.rateSpoken("d9w1", 4);
    expect(getProgress().cards.d9w1).toBeUndefined();
    expect(Object.keys(getProgress().cards)).toHaveLength(0);
    expect(todayPractice(getProgress(), today).spoken).toBe(1);
  });

  test("counts every drill and credits the streak", () => {
    progressActions.rateSpoken("d1w1", 5);
    progressActions.rateSpoken("d1w2", 3);
    expect(todayPractice(getProgress(), today).spoken).toBe(2);
    expect(getProgress().streak.current).toBe(1);
  });
});

describe("recordTalkSession", () => {
  test("ticks the talk step for today", () => {
    progressActions.recordTalkSession();
    expect(todayPractice(getProgress(), today).talkDone).toBe(true);
    expect(getProgress().talkSessions).toBe(1);
  });
});
