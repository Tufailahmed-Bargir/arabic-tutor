import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

import { alignWords } from "./align";
import { matchForm, normalizeQuranic, tokenize } from "./normalize";
import { MUQATTAAT_IDS } from "./muqattaat";
import { ayahStrength, recordOutcomes, surahStrengths } from "./progress";
import { SURAHS, surahWords } from "./quran";
import {
  applyFinal,
  createSession,
  expectedForms,
  finishSession,
  isFinished,
  previewInterim,
  summarize,
} from "./session";
import type { QuranSurahFile } from "./types";

function load(surah: number): QuranSurahFile {
  const file = path.join(
    import.meta.dir,
    "../../public/quran",
    `${surah}.json`,
  );
  return JSON.parse(readFileSync(file, "utf8")) as QuranSurahFile;
}

// What a recogniser typically writes: standard spelling, no tashkeel.
const FATIHA =
  "بسم الله الرحمن الرحيم الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين اياك نعبد واياك نستعين اهدنا الصراط المستقيم صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين";
const IKHLAS = "قل هو الله احد الله الصمد لم يلد ولم يولد ولم يكن له كفوا احد";

function statuses(expected: string, heard: string, complete = true) {
  return alignWords(tokenize(expected), tokenize(heard), {
    complete,
  }).results.map((r) => r.status);
}

describe("normalizeQuranic", () => {
  test("strips tashkeel and Quranic marks from Uthmani text", () => {
    expect(normalizeQuranic("ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ")).toBe(
      "الحمد لله رب العلمين",
    );
    expect(normalizeQuranic("ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ")).toBe(
      "ذلك الكتب لا ريب فيه",
    );
  });

  test("unifies alef and hamza forms", () => {
    expect(normalizeQuranic("أَإِآٱ")).toBe("اااا");
    expect(normalizeQuranic("مُؤْمِنُونَ")).toBe("مومنون");
    expect(normalizeQuranic("سَيِّئَةٌ")).toBe("سييه");
    expect(normalizeQuranic("السَّمَاءِ")).toBe("السما");
  });

  test("folds ya/alif maqsura and ta marbuta", () => {
    expect(normalizeQuranic("مُوسَىٰ")).toBe(normalizeQuranic("موسي"));
    expect(normalizeQuranic("الصَّلَاةَ")).toBe("الصلاه");
  });

  test("maps Indopak letter forms to Arabic", () => {
    expect(normalizeQuranic("الَّذِیۡ")).toBe("الذي");
    expect(normalizeQuranic("کَانَ")).toBe("كان");
    expect(normalizeQuranic("ہُوَ")).toBe("هو");
  });

  test("drops digits, punctuation and direction marks", () => {
    expect(normalizeQuranic("اللَّهِ ۚ‏ ١٢ ۞")).toBe("الله");
    expect(tokenize("  ")).toEqual([]);
  });

  test("imla'i word matches what a recogniser writes", () => {
    const words = surahWords(load(1), 1, 7);
    expect(expectedForms(words)).toEqual(tokenize(FATIHA));
  });

  test("a two-word imla'i spelling becomes one comparison form", () => {
    expect(matchForm("يَا أَيُّهَا")).toBe("ياايها");
  });
});

describe("alignWords", () => {
  test("a perfect recitation of al-Fatiha is all correct", () => {
    const forms = expectedForms(surahWords(load(1), 1, 7));
    const result = alignWords(forms, tokenize(FATIHA), { complete: true });
    expect(result.matched).toBe(29);
    expect(result.results.every((r) => r.status === "correct")).toBe(true);
  });

  test("marks a wrong word", () => {
    // "يولد" recited as "يلد" is close; "كفوا" recited as "مثل" is not.
    const heard = IKHLAS.replace("كفوا", "مثل");
    const result = statuses(IKHLAS, heard);
    expect(result.filter((s) => s === "wrong")).toHaveLength(1);
    expect(result[13]).toBe("wrong");
  });

  test("marks a skipped word", () => {
    const result = statuses(IKHLAS, IKHLAS.replace("الصمد ", ""));
    expect(result[5]).toBe("skipped");
    expect(result.filter((s) => s !== "correct")).toHaveLength(1);
  });

  test("tolerates repeats and self-corrections", () => {
    const heard =
      "قل هو الله احد الله الصمد لم يلد لم يلد ولم يولد ولم يكن له كفوا احد";
    expect(statuses(IKHLAS, heard).every((s) => s === "correct")).toBe(true);
  });

  test("ignores a ta'awwudh and basmala before the surah", () => {
    const heard = `اعوذ بالله من الشيطان الرجيم بسم الله الرحمن الرحيم ${IKHLAS}`;
    expect(statuses(IKHLAS, heard).every((s) => s === "correct")).toBe(true);
  });

  test("pairs a two-word imla'i spelling with either split", () => {
    const words = surahWords(load(2), 21, 21);
    const forms = expectedForms(words);
    expect(matchForm(words[0]?.imlaei ?? "")).toBe("ياايها");
    const asTwo = alignWords(forms, tokenize("يا ايها الناس اعبدوا ربكم"));
    const asOne = alignWords(forms, tokenize("ياايها الناس اعبدوا ربكم"));
    for (const a of [asTwo, asOne]) {
      expect(a.matched).toBe(4);
      expect(a.results.every((r) => r.status === "correct")).toBe(true);
    }
  });

  test("two expected words heard as one still count", () => {
    expect(statuses("ولم يكن", "ولميكن")).toEqual(["correct", "correct"]);
  });

  test("stops early on partial speech unless complete", () => {
    const partial = alignWords(tokenize(IKHLAS), tokenize("قل هو الله احد"));
    expect(partial.matched).toBe(4);
    // "الله" and "احد" recur later in the surah, so use an opening that cannot be misplaced.
    const complete = alignWords(tokenize(IKHLAS), tokenize("قل هو"), {
      complete: true,
    });
    expect(complete.results.slice(2).every((r) => r.status === "skipped")).toBe(
      true,
    );
  });

  test("handles Ayat al-Kursi with a mistake and a skip", () => {
    const words = surahWords(load(2), 255, 255);
    const forms = expectedForms(words);
    const heard = forms
      .map((f) => f)
      .filter((_, i) => i !== 9) // skip "سنة"
      .map((f) => (f === "القيوم" ? "القدوس" : f)) // wrong word
      .join(" ");
    const result = alignWords(forms, tokenize(heard), { complete: true });
    expect(result.results[6]?.status).toBe("wrong");
    expect(result.results[6]?.heard).toBe("القدوس");
    expect(result.results[9]?.status).toBe("skipped");
    expect(result.results.filter((r) => r.status === "correct")).toHaveLength(
      forms.length - 2,
    );
  });
});

describe("hifz session", () => {
  const words = surahWords(load(112), 1, 4);
  const forms = expectedForms(words);

  test("settles words segment by segment and finishes at the end", () => {
    let session = createSession(words.length);
    session = applyFinal(session, forms, "قل هو الله احد").session;
    expect(session.cursor).toBe(4);
    session = applyFinal(session, forms, "الله الصمد لم يلد ولم يولد").session;
    session = applyFinal(session, forms, "ولم يكن له كفوا احد").session;
    expect(isFinished(session)).toBe(true);
    expect(summarize(words, session).accuracy).toBe(100);
  });

  test("a wrong word at the end of a segment is settled by the next one", () => {
    let session = createSession(words.length);
    const first = applyFinal(session, forms, "قل هو الله احد الله الفرد");
    session = first.session;
    expect(first.newMistakes).toBe(0);
    expect(session.carry).toEqual(["الفرد"]);
    const second = applyFinal(session, forms, "لم يلد ولم يولد");
    expect(second.newMistakes).toBe(1);
    expect(second.session.results[5]).toEqual({
      status: "wrong",
      heard: "الفرد",
    });
  });

  test("interim speech only reveals correct words", () => {
    const session = createSession(words.length);
    expect(previewInterim(session, forms, "قل هو الملك")).toEqual([0, 1]);
  });

  test("a mistaken last word is settled when recitation stops", () => {
    let session = createSession(words.length);
    session = applyFinal(
      session,
      forms,
      IKHLAS.replace(/احد$/, "واحد واحد"),
    ).session;
    session = finishSession(session, forms);
    expect(isFinished(session)).toBe(true);
  });

  test("summary lists mistakes by ayah and only ayat recited to the end", () => {
    let session = createSession(words.length);
    session = applyFinal(
      session,
      forms,
      "قل هو الله احد الله لم يلد ولم",
    ).session;
    session = finishSession(session, forms);
    const summary = summarize(words, session);
    expect(summary.skipped).toBe(1);
    expect(summary.mistakesByAyah).toHaveLength(1);
    expect(summary.mistakesByAyah[0]?.ayah).toBe(2);
    expect(summary.firstMistake?.id).toBe("112:2:2");
    expect(summary.unreached).toBeGreaterThan(0);
    expect(summary.ayahOutcomes).toEqual([
      { ayah: 1, clean: true },
      { ayah: 2, clean: false },
    ]);
  });
});

describe("quran snapshot", () => {
  test("has every surah with the right ayah count", () => {
    expect(SURAHS).toHaveLength(114);
    for (const id of [1, 2, 9, 112, 114]) {
      expect(load(id).ayahs).toHaveLength(SURAHS[id - 1]?.ayahs ?? -1);
    }
  });

  test("word ids are surah:ayah:position", () => {
    const words = surahWords(load(2), 255, 256);
    expect(words[0]?.id).toBe("2:255:1");
    expect(words.at(-1)?.ayahEnd).toBe(true);
    expect(words.every((w) => w.page > 0 && w.line > 0)).toBe(true);
  });
});

describe("hifz progress", () => {
  const AT = "2026-10-28T09:00:00.000Z";

  test("an ayah becomes memorised after two clean recitations", () => {
    let record = recordOutcomes({}, 112, [{ ayah: 1, clean: true }], AT);
    expect(ayahStrength(record["112:1"])).toBe("learning");
    record = recordOutcomes(record, 112, [{ ayah: 1, clean: true }], AT);
    expect(ayahStrength(record["112:1"])).toBe("memorised");
  });

  test("a mistake marks the ayah weak until it is recited cleanly again", () => {
    let record = recordOutcomes({}, 112, [{ ayah: 2, clean: true }], AT);
    record = recordOutcomes(record, 112, [{ ayah: 2, clean: true }], AT);
    record = recordOutcomes(record, 112, [{ ayah: 2, clean: false }], AT);
    expect(record["112:2"]).toEqual({
      clean: 2,
      mistakes: 1,
      lastClean: false,
      lastAt: AT,
    });
    expect(ayahStrength(record["112:2"])).toBe("weak");
  });

  test("lists every ayah of a surah, unrecited ones as new", () => {
    const record = recordOutcomes({}, 112, [{ ayah: 3, clean: false }], AT);
    expect(surahStrengths(record, 112, 4)).toEqual([
      "new",
      "new",
      "weak",
      "new",
    ]);
  });
});

describe("disconnected letters (muqatta'at)", () => {
  function recite(surah: number, from: number, to: number, heard: string) {
    const words = surahWords(load(surah), from, to);
    return alignWords(expectedForms(words), tokenize(heard), { complete: true })
      .results;
  }

  test("are accepted when recited by letter name", () => {
    expect(recite(2, 1, 1, "الف لام ميم")[0]?.status).toBe("correct");
    expect(recite(19, 1, 1, "كاف ها يا عين صاد")[0]?.status).toBe("correct");
    expect(
      recite(36, 1, 2, "يا سين والقران الحكيم").map((r) => r.status),
    ).toEqual(["correct", "correct", "correct"]);
    expect(recite(42, 1, 2, "حا ميم عين سين قاف").map((r) => r.status)).toEqual(
      ["correct", "correct"],
    );
  });

  test("are still accepted as their bare skeleton", () => {
    expect(recite(2, 1, 1, "الم")[0]?.status).toBe("correct");
  });

  test("the same skeleton as an ordinary word still matches plainly", () => {
    expect(
      recite(105, 1, 1, "الم تر كيف فعل ربك باصحاب الفيل").every(
        (r) => r.status === "correct",
      ),
    ).toBe(true);
  });

  test("a three-word imla'i spelling matches", () => {
    const words = surahWords(load(20), 94, 94);
    const results = alignWords(
      expectedForms(words),
      tokenize("قال يا ابن ام لا تاخذ بلحيتي"),
    ).results;
    expect(results.slice(0, 3).map((r) => r.status)).toEqual([
      "correct",
      "correct",
      "correct",
    ]);
  });

  test("the id list matches every opening letter group in the snapshot", () => {
    const found = new Set(["20:1:1"]); // طه carries no maddah sign in this script
    for (let surah = 1; surah <= 114; surah++) {
      for (const word of surahWords(load(surah), 1, 286)) {
        if (
          /\u0653/.test(word.uthmani) &&
          !/[\u064B-\u0652]/.test(word.uthmani)
        ) {
          found.add(word.id);
        }
      }
    }
    expect([...found].sort()).toEqual([...MUQATTAAT_IDS].sort());
  });
});
