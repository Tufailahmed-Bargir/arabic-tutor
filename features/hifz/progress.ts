import type { ProgressState } from "@/lib/storage";

export type HifzRecord = ProgressState["hifz"];
export type HifzEntry = HifzRecord[string];

/** new: never recited · weak: last recitation had mistakes · learning: one clean · memorised: 2+ clean, last clean. */
export type AyahStrength = "new" | "weak" | "learning" | "memorised";

export function ayahKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function ayahStrength(entry: HifzEntry | undefined): AyahStrength {
  if (!entry) return "new";
  if (!entry.lastClean) return "weak";
  return entry.clean >= 2 ? "memorised" : "learning";
}

/** Folds one recitation's ayah outcomes into the stored record. */
export function recordOutcomes(
  record: HifzRecord,
  surah: number,
  outcomes: readonly { ayah: number; clean: boolean }[],
  at: string,
): HifzRecord {
  const next = { ...record };
  for (const { ayah, clean } of outcomes) {
    const key = ayahKey(surah, ayah);
    const prev = next[key];
    next[key] = {
      clean: (prev?.clean ?? 0) + (clean ? 1 : 0),
      mistakes: (prev?.mistakes ?? 0) + (clean ? 0 : 1),
      lastClean: clean,
      lastAt: at,
    };
  }
  return next;
}

export function surahStrengths(
  record: HifzRecord,
  surah: number,
  ayahs: number,
): AyahStrength[] {
  return Array.from({ length: ayahs }, (_, i) =>
    ayahStrength(record[ayahKey(surah, i + 1)]),
  );
}
