import { Fragment } from "react";

import { toArabicIndic } from "@/lib/arabic";
import { cn } from "@/lib/utils";
import type { WordResult } from "./align";
import type { QuranWord } from "./types";

const STATUS_CLASSES = {
  correct: "text-emerald-700 dark:text-emerald-400",
  wrong:
    "text-red-700 dark:text-red-400 bg-red-500/10 decoration-red-500/60 underline decoration-wavy underline-offset-[0.6em]",
  skipped: "text-amber-700 dark:text-amber-400 bg-amber-500/15",
} as const;

interface MushafViewProps {
  words: readonly QuranWord[];
  results: readonly (WordResult | undefined)[];
  /** Words the current (unsettled) speech seems to have recited correctly. */
  tentative: ReadonlySet<number>;
  /** Index of the next word to recite while listening, or null. */
  cursor: number | null;
  /** Show every word, recited or not. */
  peek: boolean;
}

/** The passage in Uthmani script. Unrecited words are masked but keep their width, so revealing them never reflows the page. */
export function MushafView({
  words,
  results,
  tentative,
  cursor,
  peek,
}: MushafViewProps) {
  return (
    <div
      lang="ar"
      dir="rtl"
      className="font-quran text-justify text-[1.65rem] leading-[2.6] sm:text-[1.9rem]"
    >
      {words.map((word, index) => {
        const result = results[index];
        const tentativeCorrect = !result && tentative.has(index);
        const revealed = peek || result !== undefined || tentativeCorrect;
        const newPage = index > 0 && words[index - 1]?.page !== word.page;
        return (
          <Fragment key={word.id}>
            {newPage && (
              <span
                dir="ltr"
                className="text-muted-foreground my-2 flex items-center gap-3 font-sans text-xs leading-none"
              >
                <span className="bg-border h-px flex-1" aria-hidden />
                Page {word.page}
                <span className="bg-border h-px flex-1" aria-hidden />
              </span>
            )}
            <span
              aria-hidden={!revealed}
              title={
                result?.status === "wrong" && result.heard
                  ? `Heard: ${result.heard}`
                  : undefined
              }
              className={cn(
                "rounded-md px-0.5 transition-colors duration-300",
                result && STATUS_CLASSES[result.status],
                tentativeCorrect &&
                  "text-emerald-700/60 dark:text-emerald-400/60",
                !revealed && "bg-muted text-transparent select-none",
                cursor === index &&
                  "ring-primary/50 ring-2 ring-offset-2 ring-offset-transparent",
              )}
            >
              {word.uthmani}
            </span>{" "}
            {word.ayahEnd && (
              <>
                <span
                  className="text-muted-foreground font-arabic text-[0.75em] whitespace-nowrap"
                  aria-label={`End of ayah ${word.ayah}`}
                >
                  ﴿{toArabicIndic(word.ayah)}﴾
                </span>{" "}
              </>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
