export interface SurahMeta {
  id: number;
  /** Transliterated name, e.g. "Al-Baqarah". */
  name: string;
  arabic: string;
  /** English meaning of the name. */
  meaning: string;
  ayahs: number;
  /** Whether the surah is preceded by a basmala that is not one of its ayat. */
  bismillah: boolean;
}

/** One word as stored: [uthmani, imlaei, mushaf page, line on that page]. */
export type StoredWord = [string, string, number, number];

/** Shape of public/quran/<surah>.json, written by scripts/build-quran.ts. */
export interface QuranSurahFile {
  id: number;
  ayahs: {
    /** Ayah number. */
    n: number;
    w: StoredWord[];
    /** Page and line of the ayah-end marker. */
    e: [number, number] | null;
  }[];
}

/** A word to recite, with its place in the Quran. */
export interface QuranWord {
  /** "surah:ayah:position", unique across the Quran. */
  id: string;
  surah: number;
  ayah: number;
  /** 1-based position within the ayah. */
  position: number;
  /** Uthmani script, for display. */
  uthmani: string;
  /** Standard (imla'i) spelling, used for matching what was heard. */
  imlaei: string;
  page: number;
  line: number;
  /** True for the last word of its ayah, so the ayah marker can follow it. */
  ayahEnd: boolean;
}
