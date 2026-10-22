// Plays Arabic audio: ElevenLabs via /api/tts when configured, otherwise the browser voice.
const audioCache = new Map<string, string>();
let serverTtsAvailable = true;
let current: HTMLAudioElement | null = null;

function stopCurrent() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakWithBrowser(text: string, rate: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Speech synthesis is not supported in this browser."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = rate;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.toLowerCase().startsWith("ar"));
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Could not play Arabic audio."));
    window.speechSynthesis.speak(utterance);
  });
}

async function fetchServerAudio(text: string): Promise<string | null> {
  const cached = audioCache.get(text);
  if (cached) return cached;
  if (!serverTtsAvailable) return null;

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (res.status === 501) {
    serverTtsAvailable = false;
    return null;
  }
  if (!res.ok) throw new Error("Audio service is unavailable.");

  const url = URL.createObjectURL(await res.blob());
  audioCache.set(text, url);
  return url;
}

export async function speakArabic(text: string, slow = false): Promise<void> {
  stopCurrent();
  let url: string | null = null;
  try {
    url = await fetchServerAudio(text);
  } catch {
    url = null;
  }

  if (!url) {
    await speakWithBrowser(text, slow ? 0.6 : 0.85);
    return;
  }

  const audio = new Audio(url);
  audio.playbackRate = slow ? 0.7 : 1;
  current = audio;
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error("Could not play Arabic audio."));
    audio.play().catch(reject);
  });
}
