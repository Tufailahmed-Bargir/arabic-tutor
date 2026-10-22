import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ARABIC_FONT_STACK } from "./site";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28">
        <p className="bg-background/70 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur">
          <Mic className="size-3" aria-hidden="true" />
          Now with a voice tutor
        </p>

        <p
          lang="ar"
          dir="rtl"
          className="mb-4 text-7xl leading-[1.6] font-bold sm:text-8xl"
          style={{ fontFamily: ARABIC_FONT_STACK }}
        >
          مَرْحَبًا
        </p>

        <h1
          id="hero-heading"
          className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Learn Arabic a little every day, and speak it out loud
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
          Daily lessons, the complete alphabet and a voice tutor who drills what
          you just learned. Arabic is always written out, with diacritics on or
          off.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
          >
            Start today&apos;s lesson
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="#features"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-11 px-6",
            )}
          >
            See what&apos;s inside
          </Link>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          No account needed. Your progress stays in your browser.
        </p>
      </div>
    </section>
  );
}
