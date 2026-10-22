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
  };
}

export function loadState(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = progressSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : createInitialState();
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
