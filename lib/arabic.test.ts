import { describe, expect, test } from "bun:test";
import { splitArabicRuns } from "./arabic";

describe("splitArabicRuns", () => {
  test("isolates Arabic phrases inside English prose", () => {
    expect(
      splitArabicRuns("لَا before a verb (لَا أَعْرِفُ, I don't know)."),
    ).toEqual([
      { text: "لَا", arabic: true },
      { text: " before a verb (", arabic: false },
      { text: "لَا أَعْرِفُ", arabic: true },
      { text: ", I don't know).", arabic: false },
    ]);
  });

  test("keeps Arabic punctuation inside the run", () => {
    expect(splitArabicRuns("Ask كَيْفَ حَالُكَ؟ politely")[1]).toEqual({
      text: "كَيْفَ حَالُكَ؟",
      arabic: true,
    });
  });

  test("plain English stays one run", () => {
    expect(splitArabicRuns("no Arabic here")).toEqual([
      { text: "no Arabic here", arabic: false },
    ]);
  });
});
