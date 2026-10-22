"use client";

import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "./messages";

const SUGGESTIONS = [
  { ar: "مَرْحَبًا", hint: "Say hello" },
  { ar: "اِسْمِي …", hint: "Tell it your name" },
  { ar: "كَيْفَ حَالُكَ؟", hint: "Ask how it is" },
];

export function Transcript({
  messages,
  live,
}: {
  messages: ChatMessage[];
  live: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <MessagesSquare className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-medium">
            {live
              ? "Say something to begin"
              : "Your conversation will appear here"}
          </h3>
          <p className="text-muted-foreground text-sm">
            Arabic is written out as you speak, with English alongside.
          </p>
        </div>
        <ul className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <li
              key={s.hint}
              className="bg-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
            >
              <span className="text-muted-foreground">Say:</span>
              <span lang="ar" dir="rtl" className="text-base">
                {s.ar}
              </span>
              <span className="sr-only">{s.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Conversation transcript"
      className="max-h-[28rem] overflow-y-auto px-1 py-2"
    >
      <ul className="flex flex-col gap-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </ul>
      <div ref={endRef} />
    </div>
  );
}
