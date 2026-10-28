import { normalizeQuranic } from "./normalize";

/**
 * Word ids of the disconnected letters (al-muqatta'at) that open 29 surahs. They are recited
 * by letter name ("الم" is "alif lam mim"), so they need their spoken form to match. Keyed by
 * id because the same skeleton can be an ordinary word elsewhere ("أَلَمْ" in 94:1, 105:1).
 */
export const MUQATTAAT_IDS: ReadonlySet<string> = new Set([
  "2:1:1",
  "3:1:1",
  "7:1:1",
  "10:1:1",
  "11:1:1",
  "12:1:1",
  "13:1:1",
  "14:1:1",
  "15:1:1",
  "19:1:1",
  "20:1:1",
  "26:1:1",
  "27:1:1",
  "28:1:1",
  "29:1:1",
  "30:1:1",
  "31:1:1",
  "32:1:1",
  "36:1:1",
  "38:1:1",
  "40:1:1",
  "41:1:1",
  "42:1:1",
  "42:2:1",
  "43:1:1",
  "44:1:1",
  "45:1:1",
  "46:1:1",
  "50:1:1",
  "68:1:1",
]);

// Letter names as a recogniser writes them, already normalised (no hamza, ya for alif maqsura).
const LETTER_NAMES: Record<string, string> = {
  ا: "الف",
  ل: "لام",
  م: "ميم",
  ر: "را",
  ص: "صاد",
  ك: "كاف",
  ه: "ها",
  ي: "يا",
  ع: "عين",
  ط: "طا",
  س: "سين",
  ح: "حا",
  ق: "قاف",
  ن: "نون",
};

/** "الم" spelled out as recited, "الفلامميم", for comparing with joined heard words. */
export function spelledLetters(word: string): string {
  return [...normalizeQuranic(word).replace(/ /g, "")]
    .map((letter) => LETTER_NAMES[letter] ?? letter)
    .join("");
}
