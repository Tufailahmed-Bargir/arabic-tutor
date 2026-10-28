// Typed wrapper for the browser's speech recognition (Chrome/Edge/Safari expose it with a prefix).
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: RecognitionAlternative;
}
interface RecognitionResultList {
  length: number;
  [index: number]: RecognitionResult;
}
interface RecognitionEvent {
  resultIndex: number;
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

// Errors that end a continuous session; anything else (silence, a dropped segment) just restarts it.
const FATAL_ERRORS = new Set([
  "not-allowed",
  "service-not-allowed",
  "audio-capture",
  "network",
  "language-not-supported",
]);
// Restarts this close together mean the recogniser keeps failing to start.
const RAPID_RESTART_MS = 1000;
const MAX_RAPID_RESTARTS = 5;

export interface StreamHandlers {
  /** A finished segment of speech; it will not change again. */
  onFinal: (text: string) => void;
  /** The segment currently being heard, which may still change. Empty when it settles. */
  onInterim: (text: string) => void;
  /** The session cannot continue (permission revoked, offline, unsupported language…). */
  onError: (error: string) => void;
}

export interface ArabicStream {
  /** Stops listening; resolves once any last segment has been delivered. */
  stop: () => Promise<void>;
}

// How long to wait for the recogniser to deliver its last segment after being stopped.
const STOP_TIMEOUT_MS = 1500;

/**
 * Listens continuously in Arabic until stopped. Browsers end a recognition session after a pause
 * or about a minute, so the session is restarted transparently while the stream is open.
 */
export function streamArabic(handlers: StreamHandlers): ArabicStream | null {
  const Ctor = getConstructor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "ar-SA";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let stopped = false;
  let startedAt = 0;
  let resolveEnded = () => {};
  const ended = new Promise<void>((resolve) => {
    resolveEnded = resolve;
  });
  let rapidRestarts = 0;

  const begin = () => {
    startedAt = Date.now();
    try {
      recognition.start();
    } catch {
      stopped = true;
      resolveEnded();
      handlers.onError("start-failed");
    }
  };

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result?.[0]?.transcript ?? "";
      if (result?.isFinal) {
        if (text.trim()) handlers.onFinal(text);
      } else {
        interim += `${text} `;
      }
    }
    handlers.onInterim(interim.trim());
  };
  recognition.onerror = (event) => {
    if (!FATAL_ERRORS.has(event.error)) return;
    stopped = true;
    resolveEnded();
    handlers.onError(event.error);
  };
  recognition.onend = () => {
    handlers.onInterim("");
    if (stopped) {
      resolveEnded();
      return;
    }
    rapidRestarts =
      Date.now() - startedAt < RAPID_RESTART_MS ? rapidRestarts + 1 : 0;
    if (rapidRestarts >= MAX_RAPID_RESTARTS) {
      stopped = true;
      resolveEnded();
      handlers.onError("restart-loop");
      return;
    }
    begin();
  };

  begin();
  return {
    stop: () => {
      stopped = true;
      try {
        recognition.stop();
      } catch {
        resolveEnded();
      }
      return Promise.race([
        ended,
        new Promise<void>((resolve) => setTimeout(resolve, STOP_TIMEOUT_MS)),
      ]);
    },
  };
}
