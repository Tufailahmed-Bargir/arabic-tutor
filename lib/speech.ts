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

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const ready = synth.getVoices();
  if (ready.length > 0) return Promise.resolve(ready);
  // Chrome fills the voice list asynchronously, so wait for it with a timeout.
  return new Promise((resolve) => {
    const finish = () => {
      synth.removeEventListener("voiceschanged", finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", finish);
    setTimeout(finish, 1500);
  });
}

async function speakWithBrowser(text: string, rate: number): Promise<void> {
  if (!("speechSynthesis" in window)) {
    throw new Error("Speech synthesis is not supported in this browser.");
  }
  const voices = await loadVoices();
  const voice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
  if (!voice) {
    throw new Error(
      "No Arabic voice is installed. Add an ElevenLabs API key for Arabic audio, or install the Arabic speech pack in your system settings.",
    );
  }

  await new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = rate;
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
