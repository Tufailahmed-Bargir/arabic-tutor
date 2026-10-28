import type { QuranSurahFile, QuranWord, SurahMeta } from "./types";
import surahList from "./surahs.json";

export const SURAHS: readonly SurahMeta[] = surahList;

export function getSurah(id: number): SurahMeta | undefined {
  return SURAHS[id - 1];
}

/** Flattens ayat `from`..`to` (inclusive) of a surah file into the words to recite. */
export function surahWords(
  file: QuranSurahFile,
  from: number,
  to: number,
): QuranWord[] {
  const words: QuranWord[] = [];
  for (const ayah of file.ayahs) {
    if (ayah.n < from || ayah.n > to) continue;
    ayah.w.forEach(([uthmani, imlaei, page, line], index) => {
      words.push({
        id: `${file.id}:${ayah.n}:${index + 1}`,
        surah: file.id,
        ayah: ayah.n,
        position: index + 1,
        uthmani,
        imlaei,
        page,
        line,
        ayahEnd: index === ayah.w.length - 1,
      });
    });
  }
  return words;
}

/** Loads one surah's snapshot from /public. */
export async function fetchSurahFile(
  id: number,
  signal?: AbortSignal,
): Promise<QuranSurahFile> {
  const res = await fetch(`/quran/${id}.json`, { signal });
  if (!res.ok) throw new Error(`Could not load surah ${id} (${res.status}).`);
  return (await res.json()) as QuranSurahFile;
}
