"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveServerMessage, Session } from "@google/genai";
import { z } from "zod";
import {
  GEMINI_API_VERSION,
  GEMINI_LIVE_MODEL,
  PcmPlayer,
  int16ToBase64,
  startMicCapture,
  type MicCapture,
} from "./gemini";
import type { ChatRole } from "./messages";
import type { TutorVariables } from "./tutor-prompt";

const tokenSchema = z.object({ token: z.string(), greeting: z.string() });

export type GeminiStatus = "disconnected" | "connecting" | "connected";

/** Thrown when the server has no Gemini key, so callers can keep the original error. */
export class GeminiUnavailableError extends Error {}

interface GeminiHandlers {
  onTranscript: (message: { id: string; role: ChatRole; text: string }) => void;
  onConnect: () => void;
  onError: (message: string) => void;
}

interface LiveSession {
  id: number;
  closed: boolean;
  session?: Session;
  mic?: MicCapture;
  player?: PcmPlayer;
}

async function fetchToken(variables: TutorVariables) {
  const res = await fetch("/api/voice/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variables }),
    cache: "no-store",
  });
  if (res.status === 503) {
    throw new GeminiUnavailableError("The backup tutor is not configured.");
  }
  if (!res.ok) throw new Error("Could not start the backup tutor.");
  return tokenSchema.parse(await res.json());
}

export function useGeminiSession(handlers: GeminiHandlers) {
  const [status, setStatus] = useState<GeminiStatus>("disconnected");
  const [speaking, setSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const live = useRef<LiveSession | null>(null);
  const sessionCount = useRef(0);

  const stop = useCallback(() => {
    const current = live.current;
    if (!current) return;
    live.current = null;
    current.closed = true;
    current.mic?.close();
    current.player?.close();
    current.session?.close();
    setStatus("disconnected");
    setSpeaking(false);
    setIsMuted(false);
  }, []);

  const start = useCallback(
    async (variables: TutorVariables, textOnly: boolean) => {
      stop();
      sessionCount.current += 1;
      const current: LiveSession = { id: sessionCount.current, closed: false };
      live.current = current;
      setStatus("connecting");

      // Transcripts arrive in fragments; collect them per turn under stable ids.
      let turn = 0;
      let heard = "";
      let said = "";
      const emit = (role: ChatRole, text: string) =>
        handlersRef.current.onTranscript({
          id: `g${current.id}-${turn}-${role}`,
          role,
          text,
        });

      const onMessage = (message: LiveServerMessage) => {
        const content = message.serverContent;
        if (!content) return;

        if (content.interrupted) current.player?.interrupt();
        if (content.inputTranscription?.text) {
          heard += content.inputTranscription.text;
          emit("user", heard);
        }
        if (content.outputTranscription?.text) {
          said += content.outputTranscription.text;
          emit("agent", said);
        }
        for (const part of content.modelTurn?.parts ?? []) {
          if (part.inlineData?.data) current.player?.play(part.inlineData.data);
        }
        if (content.turnComplete || content.interrupted) {
          turn += 1;
          heard = "";
          said = "";
        }
      };

      try {
        if (!textOnly) current.player = new PcmPlayer(setSpeaking);
        // The SDK is large and only needed once ElevenLabs fails, so load it on demand.
        const [{ token, greeting }, { GoogleGenAI }] = await Promise.all([
          fetchToken(variables),
          import("@google/genai"),
        ]);
        if (current.closed) return;

        const ai = new GoogleGenAI({
          apiKey: token,
          httpOptions: { apiVersion: GEMINI_API_VERSION },
        });
        // The token locks the model, prompt and transcription settings server-side.
        const session = await ai.live.connect({
          model: GEMINI_LIVE_MODEL,
          callbacks: {
            onmessage: onMessage,
            onerror: () => {
              if (current.closed) return;
              handlersRef.current.onError("The backup tutor hit a problem.");
              stop();
            },
            onclose: () => {
              if (current.closed) return;
              handlersRef.current.onError("The backup tutor disconnected.");
              stop();
            },
          },
        });
        if (current.closed) {
          session.close();
          return;
        }
        current.session = session;

        if (!textOnly) {
          current.mic = await startMicCapture((chunk) => {
            current.session?.sendRealtimeInput({
              audio: {
                data: int16ToBase64(chunk),
                mimeType: "audio/pcm;rate=16000",
              },
            });
          });
          if (current.closed) {
            current.mic.close();
            return;
          }
        }

        setStatus("connected");
        handlersRef.current.onConnect();
        // Gemini has no first-message setting, so ask it to open the way the ElevenLabs agent does.
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: `The learner just joined. Greet them with exactly: "${greeting}"`,
                },
              ],
            },
          ],
          turnComplete: true,
        });
      } catch (error) {
        if (live.current === current) stop();
        throw error;
      }
    },
    [stop],
  );

  const send = useCallback((text: string) => {
    live.current?.session?.sendRealtimeInput({ text });
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    const current = live.current;
    if (!current?.mic) return;
    current.mic.setMuted(muted);
    if (muted) current.session?.sendRealtimeInput({ audioStreamEnd: true });
    setIsMuted(muted);
  }, []);

  useEffect(() => stop, [stop]);

  return {
    status,
    mode: speaking ? ("speaking" as const) : ("listening" as const),
    isMuted,
    setMuted,
    start,
    stop,
    send,
  };
}
