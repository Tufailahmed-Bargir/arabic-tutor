"use client";

import { useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { speakArabic } from "@/lib/speech";

interface SpeakButtonProps {
  text: string;
  slow?: boolean;
  size?: "icon" | "icon-sm" | "icon-lg";
  label?: string;
}

export function SpeakButton({
  text,
  slow = false,
  size = "icon",
  label = "Play pronunciation",
}: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false);

  async function play() {
    setPlaying(true);
    try {
      await speakArabic(text, slow);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not play audio.",
      );
    } finally {
      setPlaying(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={play}
      disabled={playing}
      aria-label={slow ? `${label} (slow)` : label}
    >
      {playing ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <Volume2 aria-hidden />
      )}
    </Button>
  );
}
