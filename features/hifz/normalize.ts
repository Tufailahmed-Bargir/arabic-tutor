// Tashkeel, Quranic annotation marks (pause signs, small letters, sajdah) and tatweel.
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
// Anything left that is not a base Arabic letter: digits, punctuation, direction marks.
const NON_LETTERS = /[^\u0621-\u064A\s]/g;

/**
 * Reduces Quranic or recogniser Arabic to a bare skeleton so spelling variants compare equal:
 * no marks, one alef, hamza seats folded, ya/alif maqsura, ta marbuta as ha, and the
 * Indopak/Persian letter forms (ی ک ہ ے) mapped to their Arabic equivalents.
 */
export function normalizeQuranic(text: string): string {
  return text
    .normalize("NFC")
    .replace(MARKS, "")
    .replace(/[آأإٱٲٳ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/[ئىیيےۓ]/g, "ي")
    .replace(/ء/g, "")
    .replace(/[ةۃ]/g, "ه")
    .replace(/[ہھۀ]/g, "ه")
    .replace(/[کڪ]/g, "ك")
    .replace(NON_LETTERS, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Splits text into normalised words. */
export function tokenize(text: string): string[] {
  const normalized = normalizeQuranic(text);
  return normalized ? normalized.split(" ") : [];
}

/** The single comparison form of one expected word ("يا أيها" becomes "ياايها"). */
export function matchForm(word: string): string {
  return normalizeQuranic(word).replace(/ /g, "");
}
