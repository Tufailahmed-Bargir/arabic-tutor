import { describe, expect, test } from "bun:test";
import { bestMatch, similarity } from "./pronunciation";

describe("similarity", () => {
  test("ignores diacritics and alef variants", () => {
    expect(similarity("بيت", "بَيْت")).toBe(1);
    expect(similarity("اسد", "أَسَد")).toBe(1);
  });

  test("ignores punctuation in the target", () => {
    expect(similarity("ما اسمك", "مَا اسْمُكَ؟")).toBe(1);
  });

  test("scores a near miss highly and a different word low", () => {
    expect(similarity("بيته", "بَيْت")).toBeGreaterThanOrEqual(0.7);
    expect(similarity("كتاب", "بَيْت")).toBeLessThan(0.5);
  });

  test("returns 0 for empty input", () => {
    expect(similarity("", "بيت")).toBe(0);
    expect(similarity("1000", "بيت")).toBe(0);
  });
});

describe("bestMatch", () => {
  test("chooses the closest alternative", () => {
    const result = bestMatch(["سد", "أسد", "بيت"], "أَسَد");
    expect(result?.heard).toBe("أسد");
    expect(result?.close).toBe(true);
  });

  test("reports a miss without failing", () => {
    const result = bestMatch(["شمس"], "بَيْت");
    expect(result?.close).toBe(false);
  });

  test("returns null with no alternatives", () => {
    expect(bestMatch([], "بيت")).toBeNull();
  });
});
