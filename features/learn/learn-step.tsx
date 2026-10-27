"use client";

import { ArrowRight, Lightbulb } from "lucide-react";

import { ArabicText } from "@/components/arabic-text";
import { MixedText } from "@/components/mixed-text";
import { SpeakButton } from "@/components/speak-button";
import { WordPicture } from "@/components/word-picture";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWordImage } from "@/features/curriculum/images";
import type { Lesson, Word } from "@/features/curriculum/types";
import { ListenThrough } from "@/features/learn/listen-through";

interface LearnStepProps {
  lesson: Lesson;
  onContinue: () => void;
}

function PictureCard({ word }: { word: Word }) {
  const image = getWordImage(word.id, "large");
  if (!image) return null;
  return (
    <li className="bg-card overflow-hidden rounded-2xl border">
      <WordPicture
        image={image}
        alt={word.en}
        size={500}
        sizes="(min-width: 640px) 320px, 50vw"
        className="aspect-[4/3] w-full"
      />
      <div className="flex items-center gap-2 p-3">
        <SpeakButton text={word.ar} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{word.en}</p>
          <p className="text-muted-foreground truncate text-xs">{word.tr}</p>
        </div>
        <ArabicText text={word.ar} size="lg" />
      </div>
    </li>
  );
}

function WordRow({ word }: { word: Word }) {
  return (
    <li className="bg-card hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-3 transition-colors">
      <SpeakButton text={word.ar} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{word.en}</p>
        <p className="text-muted-foreground truncate text-xs">{word.tr}</p>
      </div>
      <ArabicText text={word.ar} size="lg" />
    </li>
  );
}

export function LearnStep({ lesson, onContinue }: LearnStepProps) {
  const pictured = lesson.words.filter((w) => getWordImage(w.id));
  const plain = lesson.words.filter((w) => !getWordImage(w.id));

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

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">
            Words <Badge variant="secondary">{lesson.words.length}</Badge>
          </h3>
          <ListenThrough words={lesson.words} />
        </div>
        {pictured.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {pictured.map((word) => (
              <PictureCard key={word.id} word={word} />
            ))}
          </ul>
        )}
        {plain.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {plain.map((word) => (
              <WordRow key={word.id} word={word} />
            ))}
          </ul>
        )}
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
