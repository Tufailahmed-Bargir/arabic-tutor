import { describe, expect, test } from "bun:test";
import { base64ToFloat32, int16ToBase64 } from "./gemini";

describe("PCM encoding", () => {
  test("round-trips little-endian 16-bit samples", () => {
    const samples = new Int16Array([0, 16384, -16384, 32767, -32768]);
    const floats = base64ToFloat32(int16ToBase64(samples));
    expect(Array.from(floats)).toEqual([0, 0.5, -0.5, 32767 / 32768, -1]);
  });

  test("encodes buffers larger than one string chunk", () => {
    const samples = new Int16Array(50_000).fill(1);
    expect(base64ToFloat32(int16ToBase64(samples))).toHaveLength(50_000);
  });
});
