import { normalizeArabic, normalizeLatin } from "@/lib/arabic";
import { LETTERS, letterForms } from "@/features/curriculum/alphabet";
import { LESSONS } from "@/features/curriculum/lessons";
import type { Lesson, Letter, Word } from "@/features/curriculum/types";

export type Rng = () => number;

/** Small deterministic PRNG so quizzes are reproducible in tests. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface Option {
  id: string;
  label: string;
  arabic: boolean;
}

export interface Reveal {
  ar: string;
  tr: string;
  en: string;
}

export type ChoiceVariant =
  "ar-en" | "en-ar" | "listen-en" | "letter-form" | "letter-sound";

export interface ChoiceExercise {
  kind: "choice";
  id: string;
  variant: ChoiceVariant;
  instruction: string;
  promptAr?: string;
  promptText?: string;
  audio?: string;
  options: Option[];
  answerId: string;
  reveal: Reveal;
}

export interface MatchPair {
  id: string;
  ar: string;
  en: string;
}

export interface MatchExercise {
  kind: "match";
  id: string;
  instruction: string;
  pairs: MatchPair[];
}

export interface TypingExercise {
  kind: "typing";
  id: string;
  instruction: string;
  promptAr: string;
  audio: string;
  answers: string[];
  reveal: Reveal;
}

export type Exercise = ChoiceExercise | MatchExercise | TypingExercise;

export interface ExerciseResult {
  id: string;
  correct: boolean;
}

const ALL_WORDS: readonly Word[] = LESSONS.flatMap((l) => l.words);

const OPTION_COUNT = 4;

function take<T>(items: readonly T[], start: number, count: number): T[] {
  const n = Math.min(count, items.length);
  return Array.from({ length: n }, (_, i) => items[(start + i) % items.length]);
}

function pickDistractors(
  word: Word,
  pool: readonly Word[],
  rng: Rng,
  count: number,
  key: (w: Word) => string,
): Word[] {
  const seen = new Set([key(word)]);
  const out: Word[] = [];
  for (const candidate of [...shuffle(pool, rng), ...shuffle(ALL_WORDS, rng)]) {
    if (out.length >= count) break;
    const k = key(candidate);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(candidate);
  }
  return out;
}

const enKey = (w: Word) => normalizeLatin(w.en);
const arKey = (w: Word) => normalizeArabic(w.ar);

function wordReveal(word: Word): Reveal {
  return { ar: word.ar, tr: word.tr, en: word.en };
}

function wordChoice(
  variant: "ar-en" | "en-ar" | "listen-en",
  word: Word,
  lesson: Lesson,
  rng: Rng,
): ChoiceExercise {
  const toArabic = variant === "en-ar";
  const distractors = pickDistractors(
    word,
    lesson.words,
    rng,
    OPTION_COUNT - 1,
    toArabic ? arKey : enKey,
  );
  const toOption = (w: Word): Option => ({
    id: w.id,
    label: toArabic ? w.ar : w.en,
    arabic: toArabic,
  });

  const base = {
    kind: "choice" as const,
    id: `${variant}:${word.id}`,
    variant,
    options: shuffle([word, ...distractors].map(toOption), rng),
    answerId: word.id,
    reveal: wordReveal(word),
  };

  if (variant === "ar-en") {
    return {
      ...base,
      instruction: "What does this mean?",
      promptAr: word.ar,
      audio: word.ar,
    };
  }
  if (variant === "en-ar") {
    return {
      ...base,
      instruction: "Choose the Arabic for",
      promptText: word.en,
    };
  }
  return {
    ...base,
    instruction: "Listen and choose the meaning",
    audio: word.ar,
  };
}

function letterReveal(letter: Letter): Reveal {
  return { ar: letter.char, tr: letter.name, en: letter.sound };
}

function letterOptions(
  letter: Letter,
  lessonLetters: readonly Letter[],
  rng: Rng,
): Option[] {
  const seen = new Set([letter.char]);
  const others: Letter[] = [];
  for (const candidate of [
    ...shuffle(lessonLetters, rng),
    ...shuffle(LETTERS, rng),
  ]) {
    if (others.length >= OPTION_COUNT - 1) break;
    if (seen.has(candidate.char)) continue;
    seen.add(candidate.char);
    others.push(candidate);
  }
  return shuffle([letter, ...others], rng).map((l) => ({
    id: l.char,
    label: l.char,
    arabic: true,
  }));
}

function letterChoice(
  letter: Letter,
  lessonLetters: readonly Letter[],
  variant: "letter-form" | "letter-sound",
  rng: Rng,
): ChoiceExercise {
  const options = letterOptions(letter, lessonLetters, rng);
  const base = {
    kind: "choice" as const,
    id: `${variant}:${letter.char}`,
    variant,
    options,
    answerId: letter.char,
    reveal: letterReveal(letter),
  };

  if (variant === "letter-sound") {
    return {
      ...base,
      instruction: "Which letter makes this sound?",
      promptText: `${letter.name}: ${letter.sound}`,
      audio: letter.example.ar,
    };
  }

  const forms = letterForms(letter);
  const positions = letter.joinsNext
    ? ([forms.initial, forms.medial, forms.final] as const)
    : ([forms.medial, forms.final] as const);
  const shown = positions[Math.floor(rng() * positions.length)];
  return {
    ...base,
    instruction: "Which letter is hiding in this shape?",
    promptAr: shown,
  };
}

/** Everything a learner might reasonably type for an English gloss. */
export function acceptedAnswers(en: string): string[] {
  const withoutParens = en.replace(/\s*\([^)]*\)/g, "");
  const variants = new Set<string>();
  for (const source of [en, withoutParens]) {
    for (const part of source.split(/[/,]/)) {
      const norm = normalizeLatin(part);
      if (!norm) continue;
      variants.add(norm);
      const bare = norm.replace(/^(he|to|a|an|the) /, "");
      if (bare) variants.add(bare);
    }
  }
  return [...variants];
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Exact match after normalising, with one typo of leeway for longer answers. */
export function isTypingCorrect(
  input: string,
  answers: readonly string[],
): boolean {
  const norm = normalizeLatin(input);
  if (!norm) return false;
  return answers.some(
    (a) => a === norm || (a.length >= 5 && editDistanceAtMostOne(a, norm)),
  );
}

const MAX_TYPED_WORDS = 3;

/** Short glosses only: typing a whole sentence from memory is a recall test, not a typo test. */
export function isTypable(word: Word): boolean {
  if (/\([^)]*:/.test(word.en)) return false;
  const bare = word.en.replace(/\s*\([^)]*\)/g, "").trim();
  return (
    acceptedAnswers(word.en).length > 0 &&
    bare.split(/\s+/).length <= MAX_TYPED_WORDS
  );
}

function typingExercise(word: Word): TypingExercise {
  return {
    kind: "typing",
    id: `typing:${word.id}`,
    instruction: "Type the English meaning",
    promptAr: word.ar,
    audio: word.ar,
    answers: acceptedAnswers(word.en),
    reveal: wordReveal(word),
  };
}

function matchExercise(lesson: Lesson, rng: Rng): MatchExercise {
  const seen = new Set<string>();
  const pairs: MatchPair[] = [];
  for (const w of shuffle(lesson.words, rng)) {
    const k = enKey(w);
    if (seen.has(k)) continue;
    seen.add(k);
    pairs.push({ id: w.id, ar: w.ar, en: w.en });
    if (pairs.length === 4) break;
  }
  return {
    kind: "match",
    id: `match:${lesson.day}`,
    instruction: "Match each word to its meaning",
    pairs,
  };
}

/** Warm-up round: hear each word and pick its meaning. */
export function buildListenRound(
  lesson: Lesson,
  seed: number,
): ChoiceExercise[] {
  const rng = createRng(seed * 31 + lesson.day);
  return shuffle(lesson.words, rng)
    .slice(0, 6)
    .map((w) => wordChoice("listen-en", w, lesson, rng));
}

export function buildQuiz(lesson: Lesson, seed: number): Exercise[] {
  const rng = createRng(seed * 7919 + lesson.day);
  const words = shuffle(lesson.words, rng);

  const choices: ChoiceExercise[] = [
    ...take(words, 0, 4).map((w) => wordChoice("ar-en", w, lesson, rng)),
    ...take(words, 4, 3).map((w) => wordChoice("en-ar", w, lesson, rng)),
    ...take(words, 1, 2).map((w) => wordChoice("listen-en", w, lesson, rng)),
  ];

  const lessonLetters = (lesson.letters ?? [])
    .map((c) => LETTERS.find((l) => l.char === c))
    .filter((l): l is Letter => l !== undefined);
  const letterExercises = lessonLetters.map((l, i) =>
    letterChoice(
      l,
      lessonLetters,
      i % 2 === 0 ? "letter-form" : "letter-sound",
      rng,
    ),
  );

  // Phrase lessons get fewer (or no) typing items rather than whole sentences to type.
  const typing = take(words.filter(isTypable), 2, 3).map(typingExercise);

  return [
    ...shuffle([...choices, ...letterExercises], rng),
    matchExercise(lesson, rng),
    ...typing,
  ];
}

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

export function scoreResults(results: readonly ExerciseResult[]): QuizScore {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  return {
    correct,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}
