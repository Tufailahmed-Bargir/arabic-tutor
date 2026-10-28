import { alignWords, type ExpectedForm, type WordResult } from "./align";
import { MUQATTAAT_IDS, spelledLetters } from "./muqattaat";
import { matchForm, tokenize } from "./normalize";
import type { QuranWord } from "./types";

export interface HifzSession {
  /** Settled result per expected word; undefined means not reached yet. */
  results: (WordResult | undefined)[];
  /** Index of the first word that has not been settled. */
  cursor: number;
  /** Heard words not yet tied to an expected word, kept for the next segment. */
  carry: string[];
}

// How far past the cursor a segment may reach, beyond twice its own length.
const LOOKAHEAD = 12;
// Unaligned words older than this are dropped, so a long stretch of noise can't stall the cursor.
const MAX_CARRY = 30;

export function createSession(wordCount: number): HifzSession {
  return {
    results: new Array(wordCount).fill(undefined),
    cursor: 0,
    carry: [],
  };
}

/** Comparison forms per word; disconnected letters also accept their recited letter names. */
export function expectedForms(words: readonly QuranWord[]): ExpectedForm[] {
  return words.map((w) =>
    MUQATTAAT_IDS.has(w.id)
      ? [matchForm(w.imlaei), spelledLetters(w.imlaei)]
      : matchForm(w.imlaei),
  );
}

export function isFinished(session: HifzSession): boolean {
  return session.cursor >= session.results.length;
}

function window(
  forms: readonly ExpectedForm[],
  cursor: number,
  heardCount: number,
) {
  return forms.slice(cursor, cursor + heardCount * 2 + LOOKAHEAD);
}

export interface Applied {
  session: HifzSession;
  /** Words newly settled as wrong or skipped by this segment. */
  newMistakes: number;
}

function commit(
  session: HifzSession,
  heard: string[],
  forms: readonly ExpectedForm[],
  complete: boolean,
): Applied {
  if (isFinished(session) || heard.length === 0) {
    return {
      session: { ...session, carry: heard.slice(-MAX_CARRY) },
      newMistakes: 0,
    };
  }
  const expected = complete
    ? forms.slice(session.cursor)
    : window(forms, session.cursor, heard.length);
  const alignment = alignWords(expected, heard, { complete });

  const results = session.results.slice();
  let newMistakes = 0;
  alignment.results.forEach((result, offset) => {
    results[session.cursor + offset] = result;
    if (result.status !== "correct") newMistakes++;
  });
  return {
    session: {
      results,
      cursor: session.cursor + alignment.matched,
      carry: heard.slice(alignment.consumed).slice(-MAX_CARRY),
    },
    newMistakes,
  };
}

/** Settles words against a final transcript segment from the recogniser. */
export function applyFinal(
  session: HifzSession,
  forms: readonly ExpectedForm[],
  text: string,
): Applied {
  return commit(session, [...session.carry, ...tokenize(text)], forms, false);
}

/**
 * Indexes of words an interim (still changing) transcript appears to have recited correctly.
 * Nothing is settled and nothing is marked wrong until the segment is final.
 */
export function previewInterim(
  session: HifzSession,
  forms: readonly ExpectedForm[],
  text: string,
): number[] {
  const heard = [...session.carry, ...tokenize(text)];
  if (isFinished(session) || heard.length === 0) return [];
  const alignment = alignWords(
    window(forms, session.cursor, heard.length),
    heard,
  );
  return alignment.results.flatMap((r, offset) =>
    r.status === "correct" ? [session.cursor + offset] : [],
  );
}

/**
 * Settles leftover heard words when recitation stops. If the leftovers plausibly cover the rest of
 * the passage, every remaining word must be accounted for; otherwise unreached words stay unreached.
 */
export function finishSession(
  session: HifzSession,
  forms: readonly ExpectedForm[],
): HifzSession {
  const remaining = forms.length - session.cursor;
  const complete = remaining > 0 && remaining <= session.carry.length + 2;
  return {
    ...commit(session, session.carry, forms, complete).session,
    carry: [],
  };
}

export interface Mistake {
  word: QuranWord;
  status: "wrong" | "skipped";
  heard: string | null;
}

export interface HifzSummary {
  correct: number;
  wrong: number;
  skipped: number;
  /** Words the recitation never reached. */
  unreached: number;
  /** Correct share of the words reached, 0-100. */
  accuracy: number;
  mistakesByAyah: { ayah: number; mistakes: Mistake[] }[];
  firstMistake: QuranWord | null;
  /** Every ayah recited to its end: clean when all its words were correct. */
  ayahOutcomes: { ayah: number; clean: boolean }[];
}

export function summarize(
  words: readonly QuranWord[],
  session: HifzSession,
): HifzSummary {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  const byAyah = new Map<number, Mistake[]>();
  const ayahState = new Map<number, { clean: boolean; reached: boolean }>();

  words.forEach((word, index) => {
    const result = session.results[index];
    const state = ayahState.get(word.ayah) ?? { clean: true, reached: true };
    if (!result) {
      state.reached = false;
    } else if (result.status === "correct") {
      correct++;
    } else {
      if (result.status === "wrong") wrong++;
      else skipped++;
      state.clean = false;
      const list = byAyah.get(word.ayah) ?? [];
      list.push({ word, status: result.status, heard: result.heard });
      byAyah.set(word.ayah, list);
    }
    ayahState.set(word.ayah, state);
  });

  const reached = correct + wrong + skipped;
  const mistakesByAyah = [...byAyah].map(([ayah, mistakes]) => ({
    ayah,
    mistakes,
  }));
  return {
    correct,
    wrong,
    skipped,
    unreached: words.length - reached,
    accuracy: reached === 0 ? 0 : Math.round((correct / reached) * 100),
    mistakesByAyah,
    firstMistake: mistakesByAyah[0]?.mistakes[0]?.word ?? null,
    ayahOutcomes: [...ayahState]
      .filter(([, s]) => s.reached)
      .map(([ayah, s]) => ({ ayah, clean: s.clean })),
  };
}
