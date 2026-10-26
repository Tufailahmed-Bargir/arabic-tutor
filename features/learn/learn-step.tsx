"use client";

import { ArrowRight, Lightbulb } from "lucide-react";
import Image from "next/image";

import { ArabicText } from "@/components/arabic-text";
import { MixedText } from "@/components/mixed-text";
import { SpeakButton } from "@/components/speak-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LETTERS, letterForms } from "@/features/curriculum/alphabet";
import { getWordImage } from "@/features/curriculum/images";
import type { Lesson, Letter } from "@/features/curriculum/types";
import { ListenThrough } from "@/features/learn/listen-through";

interface LearnStepProps {
  lesson: Lesson;
  onContinue: () => void;
}

function LetterCard({ letter }: { letter: Letter }) {
  const forms = letterForms(letter);
  const rows = [
    ["Alone", forms.isolated],
    ["Start", forms.initial],
    ["Middle", forms.medial],
    ["End", forms.final],
  ] as const;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{letter.name}</span>
          <SpeakButton text={letter.example.ar} />
        </CardTitle>
        <CardDescription>{letter.sound}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-4 gap-2 text-center">
          {rows.map(([label, form]) => (
            <div key={label} className="bg-muted/50 rounded-lg py-2">
              <dt className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
                {label}
              </dt>
              <dd className="mt-1">
                <ArabicText text={form} size="xl" />
              </dd>
            </div>
          ))}
        </dl>
        {!letter.joinsNext && (
          <p className="text-muted-foreground mt-3 text-xs">
            This letter never joins to the letter after it.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function LearnStep({ lesson, onContinue }: LearnStepProps) {
  const letters = (lesson.letters ?? [])
    .map((c) => LETTERS.find((l) => l.char === c))
    .filter((l): l is Letter => l !== undefined);

  return (
    <section aria-labelledby="learn-heading" className="space-y-8">
      <div className="space-y-1">
        <h2 id="learn-heading" className="text-lg font-semibold tracking-tight">
          Learn
        </h2>
        <p className="text-muted-foreground text-sm">{lesson.objective}</p>
      </div>

      {lesson.grammar && (
        <Card size="sm" className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-amber-500" aria-hidden />
              {lesson.grammar.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-relaxed">
            <MixedText text={lesson.grammar.body} />
          </CardContent>
        </Card>
      )}

      {letters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">The letters</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {letters.map((letter) => (
              <LetterCard key={letter.char} letter={letter} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">
            {letters.length > 0 ? "Example words" : "Words"}{" "}
            <Badge variant="secondary">{lesson.words.length}</Badge>
          </h3>
          <ListenThrough words={lesson.words} />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {lesson.words.map((word) => {
            const image = getWordImage(word.id);
            return (
              <li
                key={word.id}
                className="bg-card hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-3 transition-colors"
              >
                {image && (
                  <Image
                    src={image}
                    alt={word.en}
                    width={48}
                    height={48}
                    sizes="48px"
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                )}
                <SpeakButton text={word.ar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{word.en}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {word.tr}
                  </p>
                </div>
                <ArabicText text={word.ar} size="lg" />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="h-10 px-5" onClick={onContinue}>
          Start listening
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
