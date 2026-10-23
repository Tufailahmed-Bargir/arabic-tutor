"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mic, Search, X } from "lucide-react";

import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/features/progress/use-progress";
import { PHRASEBOOK, PHRASE_COUNT } from "./phrases";
import { filterPhrasebook } from "./search";

export function PhrasebookClient() {
  const progress = useProgress();
  const showTranslit = progress?.prefs.showTranslit ?? true;
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => filterPhrasebook(PHRASEBOOK, query),
    [query],
  );
  const matches = categories.reduce((n, c) => n + c.phrases.length, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in English, transliteration or Arabic"
            aria-label="Search phrases"
            className="h-10 ps-9 pe-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute end-1 top-1/2 -translate-y-1/2"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {query
            ? `${matches} of ${PHRASE_COUNT} phrases`
            : `${PHRASE_COUNT} phrases in ${PHRASEBOOK.length} situations`}
        </p>
        {!query && (
          <nav aria-label="Situations" className="flex flex-wrap gap-2">
            {PHRASEBOOK.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="bg-card hover:bg-muted rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                {c.title}
              </a>
            ))}
          </nav>
        )}
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No phrases match “{query}”</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a shorter word, or search in English.
          </p>
        </div>
      )}

      {categories.map((c) => (
        <section
          key={c.id}
          id={c.id}
          aria-labelledby={`${c.id}-title`}
          className="scroll-mt-6 space-y-3"
        >
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2
                id={`${c.id}-title`}
                className="text-lg font-semibold tracking-tight"
              >
                {c.title}
              </h2>
              <p className="text-muted-foreground text-sm">{c.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <ArabicText
                text={c.titleAr}
                size="sm"
                className="text-muted-foreground hidden sm:inline-block"
              />
              {c.scenarioId && (
                <Link
                  href={`/talk?topic=scenario-${c.scenarioId}`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <Mic aria-hidden />
                  Practise with tutor
                </Link>
              )}
            </div>
          </header>
          <ul className="bg-card divide-y rounded-xl border">
            {c.phrases.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-medium">{p.en}</p>
                  {showTranslit && (
                    <p className="text-muted-foreground text-sm">{p.tr}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <ArabicText
                    text={p.ar}
                    size="md"
                    className="text-end sm:max-w-md"
                  />
                  <div className="flex shrink-0">
                    <SpeakButton text={p.ar} size="icon-sm" />
                    <SpeakButton
                      text={p.ar}
                      size="icon-sm"
                      slow
                      label="Play slowly"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
