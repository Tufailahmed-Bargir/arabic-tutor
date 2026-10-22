export type ChatRole = "user" | "agent";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  /** A message typed locally that is waiting for the server to echo it back. */
  pendingEcho?: boolean;
}

/** The agent's expressive TTS model emits cues like "[happy]" or "[slow]" that are not for reading. */
export function stripAudioTags(text: string): string {
  return text
    .replace(/\[[^\]\n]{1,30}\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function upsertMessage(
  messages: ChatMessage[],
  incoming: { id: string; role: ChatRole; text: string },
): ChatMessage[] {
  const text = stripAudioTags(incoming.text);
  if (!text) return messages;

  const existing = messages.findIndex((m) => m.id === incoming.id);
  if (existing >= 0) {
    return messages.map((m, i) => (i === existing ? { ...m, text } : m));
  }

  // The server echoes typed messages; replace our optimistic copy instead of duplicating.
  if (incoming.role === "user") {
    const pending = messages.findIndex(
      (m) => m.role === "user" && m.pendingEcho && m.text === text,
    );
    if (pending >= 0) {
      return messages.map((m, i) =>
        i === pending ? { id: incoming.id, role: "user", text } : m,
      );
    }
  }

  return [...messages, { id: incoming.id, role: incoming.role, text }];
}

export function addLocalMessage(
  messages: ChatMessage[],
  id: string,
  text: string,
): ChatMessage[] {
  return [...messages, { id, role: "user", text, pendingEcho: true }];
}

export interface TextSegment {
  text: string;
  arabic: boolean;
}

const ARABIC_CHAR = "\\u0600-\\u06FF\\u0750-\\u077F";
const ARABIC_RUN = new RegExp(
  `[${ARABIC_CHAR}](?:[${ARABIC_CHAR}\\u200D\\s]*[${ARABIC_CHAR}])?`,
  "g",
);

/** Splits mixed English/Arabic text into runs so each can get the right direction. */
export function splitSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(ARABIC_RUN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), arabic: false });
    }
    segments.push({ text: match[0], arabic: true });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), arabic: false });
  }
  return segments;
}
