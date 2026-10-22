"use client";

import { useSyncExternalStore } from "react";
import { LESSONS, getLesson } from "@/features/curriculum/lessons";
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

  setPrefs(prefs: Partial<ProgressState["prefs"]>) {
    const s = current();
    commit({ ...s, prefs: { ...s.prefs, ...prefs } });
  },

  recordTalkSession() {
    const today = toDateKey();
    const s = current();
    commit(withActivity({ ...s, talkSessions: s.talkSessions + 1 }, today));
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

export function completedDays(s: ProgressState): Set<number> {
  return new Set(Object.keys(s.completed).map(Number));
}

export const TOTAL_DAYS = LESSONS.length;
