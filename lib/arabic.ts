// Arabic combining marks: tanween, short vowels, shadda, sukun, dagger alif.
const HARAKAT = /[ً-ٰٟ]/g;
const TATWEEL = /ـ/g;

export const ZWJ = "‍";

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

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndic(value: number | string): string {
  return String(value).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)] ?? d);
}

export function containsArabic(text: string): boolean {
  return /[؀-ۿ]/.test(text);
}
