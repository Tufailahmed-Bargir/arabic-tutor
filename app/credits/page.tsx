import type { Metadata } from "next";
import Link from "next/link";
import { commonsCredits } from "@/features/curriculum/images";
import { SITE_NAME } from "@/features/landing/site";

export const metadata: Metadata = {
  title: "Credits",
  description: `Attribution for the photographs, Quran text and typefaces used in ${SITE_NAME}.`,
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  const credits = commonsCredits();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Photo credits
        </h1>
        <p className="text-muted-foreground text-sm">
          Vocabulary photos come from Wikimedia Commons, Unsplash and Pexels.
          Unsplash and Pexels photos are used under their free licences. Each
          Commons photo is listed below with its author and licence.
        </p>
        <p className="text-muted-foreground text-sm">
          The hifz checker uses the Uthmani Quran text and word-by-word data
          from{" "}
          <a
            href="https://quran.com"
            className="underline underline-offset-4"
            rel="noopener noreferrer"
          >
            Quran.com
          </a>{" "}
          (Quran Foundation), set in the Amiri Quran typeface (SIL Open Font
          Licence). Recitation is checked with the browser’s built-in speech
          recognition.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to {SITE_NAME}
        </Link>
      </header>
      <ul className="divide-y rounded-xl border">
        {credits.map(([file, credit]) => (
          <li key={file} className="space-y-0.5 p-3 text-sm">
            <a
              href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`}
              className="font-medium underline underline-offset-4"
              rel="noopener noreferrer"
            >
              {file.replaceAll("_", " ")}
            </a>
            <p className="text-muted-foreground">
              {credit.artist} ·{" "}
              {credit.licenseUrl ? (
                <a
                  href={credit.licenseUrl}
                  className="underline underline-offset-4"
                  rel="noopener noreferrer"
                >
                  {credit.license}
                </a>
              ) : (
                credit.license
              )}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
