import { z } from "zod";

const cardSchema = z.object({
  ease: z.number(),
  interval: z.number(),
  reps: z.number(),
  lapses: z.number(),
  due: z.string(),
});

export const progressSchema = z.object({
  version: z.literal(1),
  completed: z.record(
    z.string(),
    z.object({ completedAt: z.string(), score: z.number() }),
  ),
  cards: z.record(z.string(), cardSchema),
  streak: z.object({
    current: z.number(),
    longest: z.number(),
    lastDate: z.string().nullable(),
  }),
  activity: z.record(z.string(), z.number()),
  prefs: z.object({
    showHarakat: z.boolean(),
    showTranslit: z.boolean(),
  }),
  talkSessions: z.number(),
  // Added after v1 shipped: defaults keep progress saved by earlier builds intact.
  practice: z
    .record(
      z.string(),
      z.object({
        reviewDone: z.boolean().default(false),
        speakDone: z.boolean().default(false),
        talkDone: z.boolean().default(false),
        spoken: z.number().default(0),
      }),
    )
    .default({}),
  // Checkpoint quizzes and speaking missions, keyed "checkpoint:<unit>" / "mission:<scenario>".
  challenges: z
    .record(
      z.string(),
      z.object({ completedAt: z.string(), score: z.number() }),
    )
    .default({}),
  // Hifz recitation results per ayah, keyed "<surah>:<ayah>".
  hifz: z
    .record(
      z.string(),
      z.object({
        clean: z.number(),
        mistakes: z.number(),
        lastClean: z.boolean(),
        lastAt: z.string(),
      }),
    )
    .default({}),
});

export type ProgressState = z.infer<typeof progressSchema>;

export const STORAGE_KEY = "arabic.progress.v1";

export function createInitialState(): ProgressState {
  return {
    version: 1,
    completed: {},
    cards: {},
    streak: { current: 0, longest: 0, lastDate: null },
    activity: {},
    prefs: { showHarakat: true, showTranslit: true },
    talkSessions: 0,
    practice: {},
    challenges: {},
    hifz: {},
  };
}

/** Parses a stored blob; anything unreadable falls back to a fresh state. */
export function parseState(raw: string | null): ProgressState {
  if (!raw) return createInitialState();
  try {
    const parsed = progressSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : createInitialState();
  } catch {
    return createInitialState();
  }
}

export function loadState(): ProgressState {
  try {
    return parseState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return createInitialState();
  }
}

export function saveState(state: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode); progress then lasts for this session only.
  }
}
