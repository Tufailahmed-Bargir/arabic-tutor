"use client";

import { useSyncExternalStore } from "react";
import { getLesson } from "@/features/curriculum/lessons";
import { recordOutcomes } from "@/features/hifz/progress";
import { toDateKey, addDays } from "@/lib/date";
import { isDue, newCard, review, type Rating } from "@/lib/srs";
import {
  STORAGE_KEY,
  createInitialState,
  loadState,
  saveState,
  type ProgressState,
} from "@/lib/storage";

let state: ProgressState | null = null;
const listeners = new Set<() => void>();

function current(): ProgressState {
  if (state === null) state = loadState();
  return state;
}

function commit(next: ProgressState) {
  state = next;
  saveState(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = loadState();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Non-hook read of the current state, for event handlers and tests. */
export function getProgress(): ProgressState {
  return current();
}

/** Null on the server and during hydration, so callers render skeletons. */
export function useProgress(): ProgressState | null {
  return useSyncExternalStore(subscribe, current, () => null);
}

function withActivity(s: ProgressState, today: string): ProgressState {
  const activity = { ...s.activity, [today]: (s.activity[today] ?? 0) + 1 };
  const { lastDate, current: cur, longest } = s.streak;
  if (lastDate === today) return { ...s, activity };
  const next = lastDate === addDays(today, -1) ? cur + 1 : 1;
  return {
    ...s,
    activity,
    streak: {
      current: next,
      longest: Math.max(longest, next),
      lastDate: today,
    },
  };
}

export type PracticeDay = ProgressState["practice"][string];

const EMPTY_PRACTICE: PracticeDay = {
  reviewDone: false,
  speakDone: false,
  talkDone: false,
  spoken: 0,
};

export function todayPractice(s: ProgressState, today: string): PracticeDay {
  return s.practice[today] ?? EMPTY_PRACTICE;
}

function patchPractice(
  s: ProgressState,
  today: string,
  patch: Partial<PracticeDay>,
): ProgressState["practice"] {
  return { ...s.practice, [today]: { ...todayPractice(s, today), ...patch } };
}

export function isPracticeComplete(day: PracticeDay): boolean {
  return day.reviewDone && day.speakDone && day.talkDone;
}

export const progressActions = {
  completeLesson(day: number, score: number) {
    const lesson = getLesson(day);
    if (!lesson) return;
    const today = toDateKey();
    const s = current();
    const cards = { ...s.cards };
    for (const w of lesson.words) cards[w.id] ??= newCard(today);
    const previous = s.completed[String(day)];
    commit(
      withActivity(
        {
          ...s,
          cards,
          completed: {
            ...s.completed,
            [String(day)]: {
              completedAt: previous?.completedAt ?? new Date().toISOString(),
              score: Math.max(previous?.score ?? 0, score),
            },
          },
        },
        today,
      ),
    );
  },

  rateCard(wordId: string, rating: Rating) {
    const today = toDateKey();
    const s = current();
    const card = s.cards[wordId] ?? newCard(today);
    commit(
      withActivity(
        { ...s, cards: { ...s.cards, [wordId]: review(card, rating, today) } },
        today,
      ),
    );
  },

  /** Counts a finished practice round towards today's streak and activity. */
  recordActivity() {
    const today = toDateKey();
    commit(withActivity(current(), today));
  },

  setPrefs(prefs: Partial<ProgressState["prefs"]>) {
    const s = current();
    commit({ ...s, prefs: { ...s.prefs, ...prefs } });
  },

  recordTalkSession() {
    const today = toDateKey();
    const s = current();
    commit(
      withActivity(
        {
          ...s,
          talkSessions: s.talkSessions + 1,
          practice: patchPractice(s, today, { talkDone: true }),
        },
        today,
      ),
    );
  },

  /** Updates today's daily-practice checklist. */
  updatePractice(patch: Partial<PracticeDay>) {
    const today = toDateKey();
    const s = current();
    commit({ ...s, practice: patchPractice(s, today, patch) });
  },

  /**
   * Counts a spoken drill. The card is only rescheduled when it already exists and is due, so a
   * word reviewed earlier today is not scheduled twice and unstudied words never become cards.
   */
  rateSpoken(wordId: string, rating: Rating) {
    const today = toDateKey();
    const s = current();
    const card = s.cards[wordId];
    const cards =
      card && isDue(card, today)
        ? { ...s.cards, [wordId]: review(card, rating, today) }
        : s.cards;
    const day = todayPractice(s, today);
    commit(
      withActivity(
        {
          ...s,
          cards,
          practice: patchPractice(s, today, { spoken: day.spoken + 1 }),
        },
        today,
      ),
    );
  },

  /** Records a finished challenge, keeping the best score and the first completion date. */
  completeChallenge(id: string, score: number) {
    const today = toDateKey();
    const s = current();
    const previous = s.challenges[id];
    commit(
      withActivity(
        {
          ...s,
          challenges: {
            ...s.challenges,
            [id]: {
              completedAt: previous?.completedAt ?? new Date().toISOString(),
              score: Math.max(previous?.score ?? 0, score),
            },
          },
        },
        today,
      ),
    );
  },

  /** Records which ayat of a hifz recitation were clean and which had mistakes. */
  recordHifz(
    surah: number,
    outcomes: readonly { ayah: number; clean: boolean }[],
  ) {
    if (outcomes.length === 0) return;
    const today = toDateKey();
    const s = current();
    commit(
      withActivity(
        {
          ...s,
          hifz: recordOutcomes(
            s.hifz,
            surah,
            outcomes,
            new Date().toISOString(),
          ),
        },
        today,
      ),
    );
  },

  reset() {
    commit(createInitialState());
  },
};

export function dueWordIds(s: ProgressState, today: string): string[] {
  return Object.entries(s.cards)
    .filter(([, card]) => isDue(card, today))
    .map(([id]) => id);
}
