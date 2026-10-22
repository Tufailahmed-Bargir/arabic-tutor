import { describe, expect, test } from "bun:test";
import { toSpeakableEnglish } from "./english-speech";

describe("toSpeakableEnglish", () => {
  test("drops parentheses that contain Arabic digits", () => {
    expect(toSpeakableEnglish("one (١)")).toBe("one");
  });

  test("keeps plain English parentheses as a spoken aside", () => {
    expect(toSpeakableEnglish("you (masculine)")).toBe("you, masculine");
  });

  test("turns slashes into spoken alternatives", () => {
    expect(toSpeakableEnglish("tall / long")).toBe("tall, or long");
  });

  test("returns nothing for Arabic-only text", () => {
    expect(toSpeakableEnglish("مَرْحَبًا")).toBe("");
  });
});
