// Arabic combining marks: tanween, short vowels, shadda, sukun, dagger alif.
const HARAKAT = /[ً-ٰٟ]/g;
const TATWEEL = /ـ/g;

export function stripHarakat(text: string): string {
  return text.replace(HARAKAT, "");
}

/** Normalises Arabic for answer comparison: no marks, tatweel, or alif/yaa variants. */
export function normalizeArabic(text: string): string {
  return stripHarakat(text)
    .replace(TATWEEL, "")
    .replace(/[آأإ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeLatin(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// A run of Arabic words, allowing spaces and Arabic punctuation between them.
const ARABIC_RUN = /[؀-ۿݐ-ݿ]+(?:[\s،؟]*[؀-ۿݐ-ݿ]+)*/g;

/** Splits English prose with embedded Arabic into runs, so each Arabic run can keep its own direction. */
export function splitArabicRuns(
  text: string,
): { text: string; arabic: boolean }[] {
  const out: { text: string; arabic: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(ARABIC_RUN)) {
    const start = match.index;
    if (start > last)
      out.push({ text: text.slice(last, start), arabic: false });
    out.push({ text: match[0], arabic: true });
    last = start + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), arabic: false });
  return out;
}

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndic(value: number | string): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)] ?? d);
}

export function containsArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}
