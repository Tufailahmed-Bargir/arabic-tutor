"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { z } from "zod";
import { progressActions } from "@/features/progress/use-progress";
import { addLocalMessage, upsertMessage, type ChatMessage } from "./messages";
import type { TalkContext } from "./lesson-context";
import { GeminiUnavailableError, useGeminiSession } from "./use-gemini-session";

const sessionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("signed"), signedUrl: z.string() }),
  z.object({ mode: z.literal("public"), agentId: z.string() }),
  z.object({ mode: z.literal("gemini") }),
]);

export type TalkErrorKind = "mic-denied" | "insecure" | "no-mic" | "session";

export interface TalkError {
  kind: TalkErrorKind;
  message: string;
}

export type VoiceProvider = "elevenlabs" | "gemini";

async function requestMicrophone(): Promise<TalkError | null> {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return {
      kind: "insecure",
      message:
        "Voice needs a secure connection. Open the app over HTTPS or on localhost.",
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return null;
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotFoundError" || name === "OverconstrainedError") {
      return {
        kind: "no-mic",
        message: "No microphone was found on this device.",
      };
    }
    return {
      kind: "mic-denied",
      message: "Microphone access was blocked.",
    };
  }
}

// The SDK forwards raw server events ("Server error: Unknown error"); quota
// exhaustion in particular arrives with no reason attached.
function describeSessionError(message: string): string {
  if (/quota|limit/i.test(message)) {
    return "The voice tutor has reached its usage limit. Please try again later.";
  }
  if (!message || message.startsWith("Server error")) {
    return "The voice tutor disconnected unexpectedly. Please start a new conversation.";
  }
  return message;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTalkSession(context: TalkContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<TalkError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  // Once ElevenLabs fails (usually quota), stay on Gemini until the page reloads.
  const [provider, setProvider] = useState<VoiceProvider>("elevenlabs");
  const providerRef = useRef<VoiceProvider>("elevenlabs");
  const textOnlyRef = useRef(false);
  const resumingRef = useRef(false);
  const localId = useRef(0);

  const switchProvider = useCallback((next: VoiceProvider) => {
    providerRef.current = next;
    setProvider(next);
  }, []);

  const gemini = useGeminiSession({
    onTranscript: (message) =>
      setMessages((prev) => upsertMessage(prev, message)),
    onConnect: () => {
      if (!resumingRef.current) progressActions.recordTalkSession();
      resumingRef.current = false;
    },
    onError: (message) => setError({ kind: "session", message }),
  });
  const startGemini = gemini.start;

  // Set below, once the ElevenLabs controls exist; the SDK's onError needs the latest copy.
  const fallBackRef = useRef<(reason: string) => void>(() => {});

  const conversation = useConversation({
    onMessage: ({ message, role, event_id, response_id }) => {
      const id =
        role === "agent" ? (response_id ?? `e${event_id}`) : `e${event_id}`;
      setMessages((prev) => upsertMessage(prev, { id, role, text: message }));
    },
    onConnect: () => {
      progressActions.recordTalkSession();
    },
    onError: (message) => {
      if (providerRef.current !== "elevenlabs") return;
      fallBackRef.current(describeSessionError(message));
    },
  });

  const { startSession, endSession, status, sendUserMessage } = conversation;

  useEffect(() => {
    fallBackRef.current = (reason) => {
      // Keep the transcript so a session cut off mid-lesson carries on.
      endSession();
      switchProvider("gemini");
      resumingRef.current = status === "connected";
      startGemini(context.dynamicVariables, textOnlyRef.current)
        .then(() =>
          setNotice("Switched to the backup tutor so you can keep practising."),
        )
        .catch((err: unknown) => {
          switchProvider("elevenlabs");
          setError({
            kind: "session",
            message:
              err instanceof GeminiUnavailableError
                ? reason
                : errorMessage(err, reason),
          });
        });
    };
  });

  const start = useCallback(
    async (options: { textOnly: boolean }) => {
      setError(null);
      setNotice(null);
      setPreparing(true);
      setTextOnly(options.textOnly);
      textOnlyRef.current = options.textOnly;

      try {
        if (!options.textOnly) {
          const micError = await requestMicrophone();
          if (micError) {
            setError(micError);
            return;
          }
        }

        if (providerRef.current === "gemini") {
          setMessages([]);
          await startGemini(context.dynamicVariables, options.textOnly);
          return;
        }

        const res = await fetch("/api/voice/session", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not start a voice session.");
        const session = sessionSchema.parse(await res.json());

        setMessages([]);
        if (session.mode === "gemini") {
          switchProvider("gemini");
          await startGemini(context.dynamicVariables, options.textOnly);
          setNotice(
            "Using the backup tutor while the main voice is unavailable.",
          );
          return;
        }

        startSession({
          ...(session.mode === "signed"
            ? { signedUrl: session.signedUrl }
            : { agentId: session.agentId }),
          dynamicVariables: context.dynamicVariables,
          textOnly: options.textOnly,
        });
      } catch (err) {
        setError({
          kind: "session",
          message: errorMessage(err, "Could not start the session."),
        });
      } finally {
        setPreparing(false);
      }
    },
    [context.dynamicVariables, startGemini, startSession, switchProvider],
  );

  const stopGemini = gemini.stop;
  const stop = useCallback(() => {
    if (providerRef.current === "gemini") stopGemini();
    else endSession();
  }, [endSession, stopGemini]);

  const sendGemini = gemini.send;
  const send = useCallback(
    (text: string) => {
      localId.current += 1;
      const id = `local-${localId.current}`;
      if (providerRef.current === "gemini") {
        // Gemini never echoes typed text back, so add it as final straight away.
        setMessages((prev) => upsertMessage(prev, { id, role: "user", text }));
        sendGemini(text);
        return;
      }
      setMessages((prev) => addLocalMessage(prev, id, text));
      sendUserMessage(text);
    },
    [sendGemini, sendUserMessage],
  );

  // Hang up if the learner navigates away mid-conversation.
  const endRef = useRef(endSession);
  useEffect(() => {
    endRef.current = endSession;
  }, [endSession]);
  useEffect(() => () => endRef.current(), []);

  const onGemini = provider === "gemini";

  return {
    messages,
    error,
    notice,
    provider,
    preparing,
    textOnly,
    status: onGemini ? gemini.status : status,
    mode: onGemini ? gemini.mode : conversation.mode,
    isMuted: onGemini ? gemini.isMuted : conversation.isMuted,
    setMuted: onGemini ? gemini.setMuted : conversation.setMuted,
    start,
    stop,
    send,
    clearError: () => setError(null),
  };
}
