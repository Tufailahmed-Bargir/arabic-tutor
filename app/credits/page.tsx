import type { Metadata } from "next";
import Link from "next/link";
import { commonsCredits } from "@/features/curriculum/images";
import { SITE_NAME } from "@/features/landing/site";

export const metadata: Metadata = {
  title: "Photo credits",
  description: `Attribution for the photographs used in ${SITE_NAME} vocabulary lessons.`,
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
