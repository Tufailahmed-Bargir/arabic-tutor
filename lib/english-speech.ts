// English narration with Kokoro, running fully in the browser. Kokoro has no Arabic voices,
// so this is only ever used for English meanings; Arabic audio stays in lib/speech.ts.
import type { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICE = "af_heart";

let engine: Promise<KokoroTTS> | null = null;
const audioCache = new Map<string, string>();
let current: HTMLAudioElement | null = null;

export function loadEnglishVoice(
  onProgress?: (percent: number) => void,
): Promise<KokoroTTS> {
  const files = new Map<string, { loaded: number; total: number }>();
  engine ??= import("kokoro-js")
    .then(({ KokoroTTS: Kokoro }) =>
      Kokoro.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (info) => {
          if (info.status !== "progress") return;
          files.set(info.file, { loaded: info.loaded, total: info.total });
          let loaded = 0;
          let total = 0;
          for (const f of files.values()) {
            loaded += f.loaded;
            total += f.total;
          }
          if (total > 0) onProgress?.(Math.round((loaded / total) * 100));
        },
      }),
    )
    .catch((error: unknown) => {
      engine = null;
      throw error;
    });
  return engine;
}

/** Drops anything Kokoro cannot pronounce (Arabic script, Arabic digits, brackets). */
export function toSpeakableEnglish(text: string): string {
  return text
    .replace(/\([^)]*[^\u0000-\u007F][^)]*\)/g, "")
    .replace(/[^\u0000-\u007F‘’“”…]/g, "")
    .replace(/\(/g, ", ")
    .replace(/\)/g, ",")
    .replace(/\s*\/\s*/g, ", or ")
    .replace(/\s+,/g, ",")
    .replace(/,(?=[^\s,])/g, ", ")
    .replace(/,{2,}/g, ",")
    .replace(/\s+/g, " ")
    .replace(/[,\s]+$/, "")
    .trim();
}

export function stopEnglish() {
  current?.pause();
  current = null;
}

export async function speakEnglish(
  text: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const speakable = toSpeakableEnglish(text);
  if (!speakable) return;

  stopEnglish();
  let url = audioCache.get(speakable);
  if (!url) {
    const tts = await loadEnglishVoice(onProgress);
    const audio = await tts.generate(speakable, { voice: VOICE, speed: 0.95 });
    url = URL.createObjectURL(audio.toBlob());
    audioCache.set(speakable, url);
  }

  const player = new Audio(url);
  current = player;
  await new Promise<void>((resolve, reject) => {
    player.onended = () => resolve();
    player.onpause = () => resolve();
    player.onerror = () => reject(new Error("Could not play English audio."));
    player.play().catch(reject);
  });
}
