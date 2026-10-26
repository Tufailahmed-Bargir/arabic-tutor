import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/features/landing/faq";
import { FeaturesGrid } from "@/features/landing/features-grid";
import { Hero } from "@/features/landing/hero";
import { JsonLd } from "@/features/landing/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/features/landing/site";

const TITLE = `Learn Arabic Online: Daily Lessons & Voice Tutor | ${SITE_NAME}`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <>
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"
        >
          <Link href="/" className="font-semibold tracking-tight">
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link href="/dashboard" className="font-medium">
              Open app
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <FeaturesGrid />
        <Faq />
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{SITE_TAGLINE}</p>
          <p>
            <Link href="/credits" className="underline underline-offset-4">
              Photo credits
            </Link>{" "}
            &middot; &copy; {SITE_NAME}
          </p>
        </div>
      </footer>

      <JsonLd />
    </>
  );
}
