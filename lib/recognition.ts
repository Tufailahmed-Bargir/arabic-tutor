// Typed wrapper for the browser's speech recognition (Chrome/Edge/Safari expose it with a prefix).
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionResultList {
  length: number;
  [index: number]: RecognitionResult;
}
interface RecognitionEvent {
  results: RecognitionResultList;
}
interface RecognitionErrorEvent {
  error: string;
}
interface RecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => RecognitionInstance;

function getConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isRecognitionSupported(): boolean {
  return getConstructor() !== null;
}

export interface Listener {
  /** Resolves with every alternative heard (possibly none). Never rejects on silence. */
  result: Promise<string[]>;
  stop: () => void;
}

export function listenArabic(): Listener {
  const Ctor = getConstructor();
  if (!Ctor) return { result: Promise.resolve([]), stop: () => {} };

  const recognition = new Ctor();
  recognition.lang = "ar-SA";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 5;

  const heard: string[] = [];
  const result = new Promise<string[]>((resolve) => {
    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        const entry = event.results[i];
        if (!entry) continue;
        for (let j = 0; j < entry.length; j++) {
          const alt = entry[j];
          if (alt?.transcript) heard.push(alt.transcript);
        }
      }
    };
    recognition.onerror = () => resolve(heard);
    recognition.onend = () => resolve(heard);
  });

  try {
    recognition.start();
  } catch {
    return { result: Promise.resolve([]), stop: () => {} };
  }
  return { result, stop: () => recognition.stop() };
}
