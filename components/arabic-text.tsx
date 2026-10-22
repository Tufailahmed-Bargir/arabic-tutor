"use client";

import { cn } from "@/lib/utils";
import { stripHarakat } from "@/lib/arabic";
import { useProgress } from "@/features/progress/use-progress";

const SIZES = {
  sm: "text-lg leading-[2]",
  md: "text-2xl leading-[2.1]",
  lg: "text-4xl leading-[2.2]",
  xl: "text-6xl leading-[2.2]",
  "2xl": "text-8xl leading-[2.2]",
} as const;

interface ArabicTextProps {
  text: string;
  size?: keyof typeof SIZES;
  /** Overrides the global diacritics preference (true shows marks, false strips them). */
  forceHarakat?: boolean;
  className?: string;
}

/** Arabic is always rendered as real text, with generous line height so marks are never clipped. */
export function ArabicText({
  text,
  size = "md",
  forceHarakat,
  className,
}: ArabicTextProps) {
  const progress = useProgress();
  const show = forceHarakat ?? progress?.prefs.showHarakat ?? true;

  return (
    <span
      lang="ar"
      dir="rtl"
      className={cn("font-arabic inline-block", SIZES[size], className)}
    >
      {show ? text : stripHarakat(text)}
    </span>
  );
}
