import { describe, expect, test } from "bun:test";
import { getScenario } from "@/features/talk/scenarios";
import { PHRASEBOOK, PHRASE_COUNT } from "./phrases";
import { filterPhrasebook } from "./search";

describe("phrasebook", () => {
  test("ids are unique and every linked mission exists", () => {
    const ids = PHRASEBOOK.flatMap((c) => c.phrases.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(PHRASE_COUNT);
    for (const c of PHRASEBOOK) {
      if (c.scenarioId) expect(getScenario(c.scenarioId)).toBeDefined();
      expect(c.phrases.length).toBeGreaterThanOrEqual(8);
    }
  });

  test("every phrase is fully written out", () => {
    for (const c of PHRASEBOOK) {
      for (const p of c.phrases) {
        expect(p.ar.trim()).not.toBe("");
        expect(p.tr.trim()).not.toBe("");
        expect(p.en.trim()).not.toBe("");
      }
    }
  });

  test("search matches English, transliteration and bare Arabic", () => {
    const byEnglish = filterPhrasebook(PHRASEBOOK, "bill");
    expect(byEnglish.flatMap((c) => c.phrases).map((p) => p.en)).toContain(
      "The bill, please.",
    );
    expect(
      filterPhrasebook(PHRASEBOOK, "al-hisabu").flatMap((c) => c.phrases),
    ).not.toHaveLength(0);
    expect(
      filterPhrasebook(PHRASEBOOK, "الحساب").flatMap((c) => c.phrases),
    ).not.toHaveLength(0);
    expect(filterPhrasebook(PHRASEBOOK, "zzzz")).toEqual([]);
    expect(filterPhrasebook(PHRASEBOOK, "  ")).toHaveLength(PHRASEBOOK.length);
  });
});
