import { describe, expect, test } from "bun:test";
import { stripAudioTags, upsertMessage } from "./messages";

describe("stripAudioTags", () => {
  test("removes expressive cues and keeps the words", () => {
    expect(stripAudioTags("[happy] Very good! [slow] أَسَد, asad.")).toBe(
      "Very good! أَسَد, asad.",
    );
  });

  test("leaves text without cues alone", () => {
    expect(stripAudioTags("How are you?")).toBe("How are you?");
  });
});

describe("upsertMessage", () => {
  test("cleans tags and updates a streamed agent message in place", () => {
    let list = upsertMessage([], {
      id: "r1",
      role: "agent",
      text: "[warm] Hel",
    });
    list = upsertMessage(list, {
      id: "r1",
      role: "agent",
      text: "[warm] Hello!",
    });
    expect(list).toHaveLength(1);
    expect(list[0]?.text).toBe("Hello!");
  });

  test("ignores messages that are only a cue", () => {
    expect(
      upsertMessage([], { id: "r2", role: "agent", text: "[happy]" }),
    ).toEqual([]);
  });
});
