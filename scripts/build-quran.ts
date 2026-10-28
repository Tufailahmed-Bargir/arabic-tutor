/**
 * Snapshots the Quran's word-by-word text from the Quran.com v4 API into static files:
 *   public/quran/<surah>.json   one lazily-fetched file per surah (see QuranSurahFile)
 *   features/hifz/surahs.json   chapter list for the picker
 *
 * Run with `bun run build:quran`. The output is committed, so the app never calls the API at runtime.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { QuranSurahFile, SurahMeta } from "../features/hifz/types";

const API = "https://api.quran.com/api/v4";
const ROOT = path.resolve(import.meta.dir, "..");
const OUT_DIR = path.join(ROOT, "public", "quran");
const META_FILE = path.join(ROOT, "features", "hifz", "surahs.json");

interface ApiWord {
  position: number;
  char_type_name: "word" | "end" | string;
  text_uthmani: string;
  text_imlaei: string;
  page_number: number;
  line_number: number;
}
interface ApiVerse {
  verse_number: number;
  words: ApiWord[];
}
interface ApiChapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  bismillah_pre: boolean;
  translated_name: { name: string };
}

async function getJson<T>(url: string): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as T;
    if (attempt === 4)
      throw new Error(`${res.status} ${res.statusText}: ${url}`);
    await Bun.sleep(1000 * attempt);
  }
}

async function fetchSurah(id: number): Promise<QuranSurahFile> {
  const verses: ApiVerse[] = [];
  for (let page = 1; ; page++) {
    const data = await getJson<{
      verses: ApiVerse[];
      pagination: { next_page: number | null };
    }>(
      `${API}/verses/by_chapter/${id}?words=true&word_fields=text_uthmani,text_imlaei&per_page=50&page=${page}`,
    );
    verses.push(...data.verses);
    if (!data.pagination.next_page) break;
  }

  return {
    id,
    ayahs: verses.map((verse) => {
      const words = verse.words.filter((w) => w.char_type_name === "word");
      const end = verse.words.find((w) => w.char_type_name === "end");
      if (words.some((w, i) => w.position !== i + 1)) {
        throw new Error(
          `Unexpected word positions in ${id}:${verse.verse_number}`,
        );
      }
      return {
        n: verse.verse_number,
        w: words.map((w) => [
          w.text_uthmani,
          w.text_imlaei,
          w.page_number,
          w.line_number,
        ]),
        e: end ? [end.page_number, end.line_number] : null,
      };
    }),
  };
}

async function main() {
  const { chapters } = await getJson<{ chapters: ApiChapter[] }>(
    `${API}/chapters?language=en`,
  );
  if (chapters.length !== 114) throw new Error("Expected 114 chapters");

  const meta: SurahMeta[] = chapters.map((c) => ({
    id: c.id,
    name: c.name_simple,
    arabic: c.name_arabic,
    meaning: c.translated_name.name,
    ayahs: c.verses_count,
    bismillah: c.bismillah_pre,
  }));

  await mkdir(OUT_DIR, { recursive: true });
  let words = 0;
  for (const chapter of chapters) {
    const surah = await fetchSurah(chapter.id);
    if (surah.ayahs.length !== chapter.verses_count) {
      throw new Error(`Surah ${chapter.id}: got ${surah.ayahs.length} ayat`);
    }
    words += surah.ayahs.reduce((sum, a) => sum + a.w.length, 0);
    await writeFile(
      path.join(OUT_DIR, `${chapter.id}.json`),
      JSON.stringify(surah),
    );
    console.log(`${chapter.id} ${chapter.name_simple}`);
  }
  await writeFile(META_FILE, `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`Wrote 114 surahs, ${words} words.`);
}

await main();
