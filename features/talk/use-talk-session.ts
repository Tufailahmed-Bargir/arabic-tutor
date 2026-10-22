"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { z } from "zod";
import { progressActions } from "@/features/progress/use-progress";
import { addLocalMessage, upsertMessage, type ChatMessage } from "./messages";
import type { TalkContext } from "./lesson-context";

const sessionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("signed"), signedUrl: z.string() }),
  z.object({ mode: z.literal("public"), agentId: z.string() }),
]);

export type TalkErrorKind = "mic-denied" | "insecure" | "no-mic" | "session";

export interface TalkError {
  kind: TalkErrorKind;
  message: string;
}

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

export function useTalkSession(context: TalkContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<TalkError | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const localId = useRef(0);

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
      setError({
        kind: "session",
        message: message || "The conversation was interrupted.",
      });
    },
  });

  const { startSession, endSession, status, sendUserMessage } = conversation;

  const start = useCallback(
    async (options: { textOnly: boolean }) => {
      setError(null);
      setPreparing(true);
      setTextOnly(options.textOnly);

      try {
        if (!options.textOnly) {
          const micError = await requestMicrophone();
          if (micError) {
            setError(micError);
            return;
          }
        }

        const res = await fetch("/api/voice/session", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not start a voice session.");
        const session = sessionSchema.parse(await res.json());

        setMessages([]);
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
          message:
            err instanceof Error ? err.message : "Could not start the session.",
        });
      } finally {
        setPreparing(false);
      }
    },
    [context.dynamicVariables, startSession],
  );

  const stop = useCallback(() => {
    endSession();
  }, [endSession]);

  const send = useCallback(
    (text: string) => {
      localId.current += 1;
      setMessages((prev) =>
        addLocalMessage(prev, `local-${localId.current}`, text),
      );
      sendUserMessage(text);
    },
    [sendUserMessage],
  );

  // Hang up if the learner navigates away mid-conversation.
  const endRef = useRef(endSession);
  useEffect(() => {
    endRef.current = endSession;
  }, [endSession]);
  useEffect(() => () => endRef.current(), []);

  return {
    messages,
    error,
    preparing,
    textOnly,
    status,
    mode: conversation.mode,
    isMuted: conversation.isMuted,
    setMuted: conversation.setMuted,
    start,
    stop,
    send,
    clearError: () => setError(null),
  };
}
