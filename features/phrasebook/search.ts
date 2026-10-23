import { containsArabic, normalizeArabic, normalizeLatin } from "@/lib/arabic";
import type { PhraseCategory } from "./phrases";

/** Matches English, transliteration or Arabic (with or without vowel marks). Empty categories drop out. */
export function filterPhrasebook(
  categories: readonly PhraseCategory[],
  query: string,
): PhraseCategory[] {
  const q = query.trim();
  if (!q) return [...categories];
  const arabic = containsArabic(q);
  const needle = arabic ? normalizeArabic(q) : normalizeLatin(q);
  return categories
    .map((c) => ({
      ...c,
      phrases: c.phrases.filter((p) =>
        arabic
          ? normalizeArabic(p.ar).includes(needle)
          : normalizeLatin(`${p.en} ${p.tr}`).includes(needle),
      ),
    }))
    .filter((c) => c.phrases.length > 0);
}
