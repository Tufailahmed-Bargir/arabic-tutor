import { normalizeArabic } from "@/lib/arabic";

const NON_LETTERS = /[^ء-يٱ-ۓ ]/g;

function clean(text: string): string {
  return normalizeArabic(text)
    .replace(NON_LETTERS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0] ?? 0;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j] ?? 0;
      row[j] = Math.min(
        (row[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = temp;
    }
  }
  return row[b.length] ?? 0;
}

/** 1 means identical once diacritics are ignored; 0 means nothing in common. */
export function similarity(heard: string, target: string): number {
  const a = clean(heard);
  const b = clean(target);
  if (!a || !b) return 0;
  if (a === b) return 1;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
}

export const CLOSE_MATCH = 0.7;

export interface HeardResult {
  /** Best alternative from the recogniser. */
  heard: string;
  score: number;
  close: boolean;
}

/** Picks the alternative closest to the target. Recognisers mishear learners, so this only encourages. */
export function bestMatch(
  alternatives: readonly string[],
  target: string,
): HeardResult | null {
  let best: HeardResult | null = null;
  for (const alt of alternatives) {
    const score = similarity(alt, target);
    if (!best || score > best.score)
      best = { heard: alt, score, close: score >= CLOSE_MATCH };
  }
  return best;
}
