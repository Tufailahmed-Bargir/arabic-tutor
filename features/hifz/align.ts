import { editDistance } from "@/lib/pronunciation";

export type WordStatus = "correct" | "wrong" | "skipped";

export interface WordResult {
  status: WordStatus;
  /** What was heard in this word's place, or null when it was skipped. */
  heard: string | null;
}

export interface Alignment {
  /** One result for each of the first `matched` expected words. */
  results: WordResult[];
  /** How many expected words the recitation reached. */
  matched: number;
  /** How many heard words were used; the rest trail after the last aligned word. */
  consumed: number;
}

/** A heard word at least this similar to the expected one counts as recited correctly. */
export const CORRECT_SIMILARITY = 0.7;

// Scores are maximised. A matched word earns up to +1 and a wrong one costs up to -1. Skipping an
// expected word costs more than a wrong word, so a heard word in its slot reads as a mistake rather
// than a skip. An extra heard word (a repeat or self-correction) is cheap.
const SKIP = -1.2;
const EXTRA = -0.5;
// Pairing two heard words with one expected word, or the reverse, pays a small penalty.
const REGROUP = -0.1;

export function wordSimilarity(heard: string, expected: string): number {
  if (!heard || !expected) return 0;
  if (heard === expected) return 1;
  return (
    1 - editDistance(heard, expected) / Math.max(heard.length, expected.length)
  );
}

// Unrelated Arabic words still share letters like ا and ل, so below the threshold every pairing
// scores about the same; otherwise the aligner would pair noise with words instead of skipping.
function pairScore(similarity: number): number {
  return similarity >= CORRECT_SIMILARITY ? similarity : -1 + 0.2 * similarity;
}

const Op = {
  Start: 0,
  Extra: 1,
  Skip: 2,
  Pair: 3,
  /** One expected word heard as two words. */
  Merge: 4,
  /** Two expected words heard as one word. */
  Split: 5,
} as const;
type Op = (typeof Op)[keyof typeof Op];

interface AlignOptions {
  /**
   * The recitation is over and every expected word must be accounted for, so unreached words are
   * skipped. Otherwise the alignment may stop early, leaving later words for more speech.
   */
  complete?: boolean;
}

/**
 * Aligns heard words to expected words in order (both already normalised, see `tokenize` and
 * `matchForm`). Heard words before the first expected word (a ta'awwudh or basmala) and after the
 * last aligned one are ignored.
 */
export function alignWords(
  expected: readonly string[],
  heard: readonly string[],
  { complete = false }: AlignOptions = {},
): Alignment {
  const n = expected.length;
  const m = heard.length;
  const width = n + 1;
  const score = new Float64Array((m + 1) * width);
  const op = new Uint8Array((m + 1) * width);
  const at = (i: number, j: number) => i * width + j;

  for (let j = 1; j <= n; j++) {
    score[at(0, j)] = j * SKIP;
    op[at(0, j)] = Op.Skip;
  }
  // Leading heard words are free: score[i][0] stays 0 with Op.Start.

  for (let i = 1; i <= m; i++) {
    const h = heard[i - 1] ?? "";
    for (let j = 1; j <= n; j++) {
      const e = expected[j - 1] ?? "";
      let best =
        (score[at(i - 1, j - 1)] ?? 0) + pairScore(wordSimilarity(h, e));
      let bestOp: Op = Op.Pair;

      const extra = (score[at(i - 1, j)] ?? 0) + EXTRA;
      if (extra > best) [best, bestOp] = [extra, Op.Extra];

      const skip = (score[at(i, j - 1)] ?? 0) + SKIP;
      if (skip > best) [best, bestOp] = [skip, Op.Skip];

      if (i >= 2) {
        const joined = (heard[i - 2] ?? "") + h;
        const merge =
          (score[at(i - 2, j - 1)] ?? 0) +
          pairScore(wordSimilarity(joined, e)) +
          REGROUP;
        if (merge > best) [best, bestOp] = [merge, Op.Merge];
      }
      if (j >= 2) {
        const joined = (expected[j - 2] ?? "") + e;
        const split =
          (score[at(i - 1, j - 2)] ?? 0) +
          2 * pairScore(wordSimilarity(h, joined)) +
          REGROUP;
        if (split > best) [best, bestOp] = [split, Op.Split];
      }

      score[at(i, j)] = best;
      op[at(i, j)] = bestOp;
    }
  }

  // Trailing heard words are free, so the alignment may end at any heard word. Unless the
  // recitation is complete, it may also end before the last expected word.
  let endI = 0;
  let endJ = complete ? n : 0;
  let endScore = complete ? (score[at(0, n)] ?? 0) : 0;
  for (let i = 0; i <= m; i++) {
    for (let j = complete ? n : 0; j <= n; j++) {
      const s = score[at(i, j)] ?? 0;
      if (s > endScore + 1e-9) [endScore, endI, endJ] = [s, i, j];
    }
  }

  const results: WordResult[] = new Array(endJ);
  let i = endI;
  let j = endJ;
  while (j > 0) {
    const step = op[at(i, j)];
    if (step === Op.Pair || step === Op.Merge) {
      const take = step === Op.Merge ? 2 : 1;
      const words = heard.slice(i - take, i);
      const similarity = wordSimilarity(words.join(""), expected[j - 1] ?? "");
      results[j - 1] = {
        status: similarity >= CORRECT_SIMILARITY ? "correct" : "wrong",
        heard: words.join(" "),
      };
      i -= take;
      j -= 1;
    } else if (step === Op.Split) {
      const h = heard[i - 1] ?? "";
      const joined = (expected[j - 2] ?? "") + (expected[j - 1] ?? "");
      const status =
        wordSimilarity(h, joined) >= CORRECT_SIMILARITY ? "correct" : "wrong";
      results[j - 1] = { status, heard: h };
      results[j - 2] = { status, heard: h };
      i -= 1;
      j -= 2;
    } else if (step === Op.Skip) {
      results[j - 1] = { status: "skipped", heard: null };
      j -= 1;
    } else if (step === Op.Extra) {
      i -= 1;
    } else {
      break;
    }
  }

  return { results, matched: endJ, consumed: endI };
}
