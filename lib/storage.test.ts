import { describe, expect, test } from "bun:test";
import { createInitialState, parseState } from "./storage";

// Shape written by the first release, before `practice` existed.
const LEGACY_V1 = {
  version: 1,
  completed: {
    "1": { completedAt: "2026-10-20T08:00:00.000Z", score: 90 },
    "2": { completedAt: "2026-10-21T08:00:00.000Z", score: 80 },
  },
  cards: {
    d1w1: { ease: 2.5, interval: 3, reps: 2, lapses: 0, due: "2026-10-25" },
  },
  streak: { current: 2, longest: 4, lastDate: "2026-10-21" },
  activity: { "2026-10-21": 3 },
  prefs: { showHarakat: false, showTranslit: true },
  talkSessions: 2,
};

describe("parseState", () => {
  test("keeps progress saved before new fields existed", () => {
    const state = parseState(JSON.stringify(LEGACY_V1));
    expect(Object.keys(state.completed)).toEqual(["1", "2"]);
    expect(state.cards.d1w1?.interval).toBe(3);
    expect(state.streak.current).toBe(2);
    expect(state.prefs.showHarakat).toBe(false);
    expect(state.talkSessions).toBe(2);
    expect(state.practice).toEqual({});
    expect(state.challenges).toEqual({});
    expect(state.hifz).toEqual({});
  });

  test("keeps hifz results", () => {
    const state = createInitialState();
    state.hifz["112:1"] = {
      clean: 2,
      mistakes: 1,
      lastClean: true,
      lastAt: "2026-10-28T09:00:00.000Z",
    };
    expect(parseState(JSON.stringify(state)).hifz).toEqual(state.hifz);
  });

  test("keeps challenge results", () => {
    const state = createInitialState();
    state.challenges["mission:cafe"] = {
      completedAt: "2026-10-23T09:00:00.000Z",
      score: 100,
    };
    expect(parseState(JSON.stringify(state)).challenges).toEqual(
      state.challenges,
    );
  });

  test("falls back to a fresh state for corrupt data", () => {
    expect(parseState("{not json")).toEqual(createInitialState());
    expect(parseState(JSON.stringify({ version: 2 }))).toEqual(
      createInitialState(),
    );
    expect(parseState(null)).toEqual(createInitialState());
  });

  test("round-trips today's practice state", () => {
    const state = createInitialState();
    state.practice["2026-10-22"] = {
      reviewDone: true,
      speakDone: false,
      talkDone: false,
      spoken: 3,
    };
    expect(
      parseState(JSON.stringify(state)).practice["2026-10-22"]?.spoken,
    ).toBe(3);
  });
});
