"use client";

import { useState } from "react";
import { Check, Copy, Languages } from "lucide-react";
import { toast } from "sonner";
import { ArabicText } from "@/components/arabic-text";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/features/progress/use-progress";
import { cn } from "@/lib/utils";
import { splitSegments, type ChatMessage } from "./messages";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const progress = useProgress();
  const prefHarakat = progress?.prefs.showHarakat ?? true;
  const [marks, setMarks] = useState<boolean | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const segments = splitSegments(message.text);
  const hasArabic = segments.some((s) => s.arabic);
  const effectiveMarks = marks ?? prefHarakat;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy to the clipboard.");
    }
  }

  return (
    <li className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card rounded-bl-md border",
          message.pendingEcho && "opacity-70",
        )}
      >
        <p className="sr-only">{isUser ? "You said" : "Ustadh said"}</p>
        <p className="wrap-break-word whitespace-pre-wrap">
          {segments.map((segment, i) =>
            segment.arabic ? (
              <bdi key={i} dir="rtl" lang="ar">
                <ArabicText
                  text={segment.text}
                  size="lg"
                  forceHarakat={effectiveMarks}
                  className="inline"
                />
              </bdi>
            ) : (
              <bdi key={i}>{segment.text}</bdi>
            ),
          )}
        </p>
        <div
          className={cn(
            "mt-2 flex items-center gap-1 opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {hasArabic && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-pressed={effectiveMarks}
              onClick={() => setMarks(!effectiveMarks)}
            >
              <Languages />
              {effectiveMarks ? "Hide marks" : "Show marks"}
            </Button>
          )}
          <Button type="button" variant="ghost" size="xs" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </li>
  );
}
