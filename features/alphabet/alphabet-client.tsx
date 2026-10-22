"use client";

import { useState } from "react";
import { ArabicText } from "@/components/arabic-text";
import { SpeakButton } from "@/components/speak-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LETTERS, letterForms } from "@/features/curriculum/alphabet";
import type { Letter } from "@/features/curriculum/types";
import { HarakatPrimer } from "./harakat-primer";

const FORM_LABELS = [
  ["isolated", "Alone"],
  ["initial", "Start"],
  ["medial", "Middle"],
  ["final", "End"],
] as const;

function LetterDialog({
  letter,
  onClose,
}: {
  letter: Letter | null;
  onClose: () => void;
}) {
  const forms = letter ? letterForms(letter) : null;

  return (
    <Dialog open={letter !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {letter && forms && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-baseline gap-3">
                <ArabicText text={letter.char} size="xl" />
                <span>{letter.name}</span>
              </DialogTitle>
              <DialogDescription>Sounds like {letter.sound}.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-2">
              {FORM_LABELS.map(([key, label]) => (
                <div
                  key={key}
                  className="bg-muted/40 rounded-xl border px-1 py-3 text-center"
                >
                  <ArabicText text={forms[key]} size="xl" />
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {!letter.joinsNext && (
              <p className="text-muted-foreground text-xs">
                This letter never joins the letter after it, so its start and
                alone forms look the same.
              </p>
            )}

            <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div className="min-w-0">
                <ArabicText text={letter.example.ar} size="xl" forceHarakat />
                <p className="text-muted-foreground text-sm">
                  {letter.example.tr} · {letter.example.en}
                </p>
              </div>
              <SpeakButton text={letter.example.ar} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AlphabetClient() {
  const [selected, setSelected] = useState<Letter | null>(null);

  return (
    <>
      <section aria-labelledby="letters-heading" className="space-y-3">
        <h2 id="letters-heading" className="text-lg font-semibold">
          Letters
        </h2>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {LETTERS.map((letter) => (
            <li key={letter.char}>
              <button
                type="button"
                onClick={() => setSelected(letter)}
                aria-label={`${letter.name} letter`}
                className="group bg-card focus-visible:ring-ring/50 flex w-full flex-col items-center gap-1 rounded-xl border px-2 py-3 transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-sm focus-visible:ring-3 focus-visible:outline-none"
              >
                <ArabicText text={letter.char} size="xl" />
                <span className="text-muted-foreground group-hover:text-foreground text-[11px]">
                  {letter.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <HarakatPrimer />
      <LetterDialog letter={selected} onClose={() => setSelected(null)} />
    </>
  );
}
