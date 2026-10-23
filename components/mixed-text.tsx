import { splitArabicRuns } from "@/lib/arabic";

/** English with inline Arabic: each Arabic run is isolated so brackets and commas stay in order. */
export function MixedText({ text }: { text: string }) {
  return splitArabicRuns(text).map((run, i) =>
    run.arabic ? (
      <bdi key={i} lang="ar" dir="rtl" className="font-arabic text-[1.15em]">
        {run.text}
      </bdi>
    ) : (
      run.text
    ),
  );
}
