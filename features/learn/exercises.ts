import { normalizeArabic, normalizeLatin } from "@/lib/arabic";
import { getWordImage, type WordImage } from "@/features/curriculum/images";
import { ALL_LESSONS } from "@/features/curriculum/lessons";
import type { Lesson, Word } from "@/features/curriculum/types";

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
  /** Spoiler-free text for picture options, so a failed image load never leaks the answer. */
  label: string;
  arabic: boolean;
  image?: WordImage;
}

export interface Reveal {
  ar: string;
  tr: string;
  en: string;
}

export type ChoiceVariant =
  "ar-en" | "en-ar" | "listen-en" | "image-ar" | "ar-image" | "listen-image";

export interface ChoiceExercise {
  kind: "choice";
  id: string;
  variant: ChoiceVariant;
  instruction: string;
  promptAr?: string;
  promptText?: string;
  promptImage?: WordImage;
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

const ALL_WORDS: readonly Word[] = ALL_LESSONS.flatMap((l) => l.words);

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

/** Words that have a photo; picture quizzes only ever draw options from these. */
export function pictureWords(words: readonly Word[]): Word[] {
  return words.filter((w) => getWordImage(w.id) !== undefined);
}

const PICTURE_POOL: readonly Word[] = pictureWords(ALL_WORDS);

/** Different words that would still show near-identical photos, so they never share a question. */
const LOOKALIKES = [
  ["star", "night"],
  ["moon", "crescent"],
];

/** Plural, article and parenthetical differences are the same meaning for picture options. */
function meaningKey(word: Word): string {
  const first = normalizeLatin(
    word.en.replace(/\s*\([^)]*\)/g, "").split("/")[0]!,
  )
    .replace(/^(a|an|the) /, "")
    .replace(/ies$/, "y")
    .replace(/s$/, "");
  const group = LOOKALIKES.findIndex((g) => g.includes(first));
  return group === -1 ? first : `group:${group}`;
}

/** Picture questions are Arabic-first: you read, hear or choose Arabic, never English. */
type PictureVariant = "image-ar" | "ar-image" | "listen-image";

function pictureDistractors(
  word: Word,
  pool: readonly Word[],
  rng: Rng,
): Word[] {
  const image = getWordImage(word.id)!;
  const seenMeaning = new Set([meaningKey(word)]);
  const seenImage = new Set([image.src]);
  const seenArabic = new Set([arKey(word)]);
  const out: Word[] = [];
  for (const candidate of [
    ...shuffle(pool, rng),
    ...shuffle(PICTURE_POOL, rng),
  ]) {
    if (out.length >= OPTION_COUNT - 1) break;
    const src = getWordImage(candidate.id)!.src;
    const meaning = meaningKey(candidate);
    const arabic = arKey(candidate);
    if (seenImage.has(src) || seenMeaning.has(meaning)) continue;
    if (seenArabic.has(arabic)) continue;
    seenImage.add(src);
    seenMeaning.add(meaning);
    seenArabic.add(arabic);
    out.push(candidate);
  }
  return out;
}

function pictureChoice(
  variant: PictureVariant,
  word: Word,
  pool: readonly Word[],
  rng: Rng,
): ChoiceExercise {
  const picked = shuffle([word, ...pictureDistractors(word, pool, rng)], rng);
  const options: Option[] = picked.map((w, i) =>
    variant === "image-ar"
      ? { id: w.id, label: w.ar, arabic: true }
      : {
          id: w.id,
          label: `Picture ${i + 1}`,
          arabic: false,
          image: getWordImage(w.id, "large"),
        },
  );
  const base = {
    kind: "choice" as const,
    id: `${variant}:${word.id}`,
    variant,
    options,
    answerId: word.id,
    reveal: wordReveal(word),
  };
  // Speaking the answer on "image-ar" would give it away, so only the picture-choosing
  // variants carry audio.
  if (variant === "image-ar") {
    return {
      ...base,
      instruction: "Choose the Arabic word for this picture",
      promptImage: getWordImage(word.id, "large"),
    };
  }
  if (variant === "ar-image") {
    return {
      ...base,
      instruction: "Choose the picture for",
      promptAr: word.ar,
      audio: word.ar,
    };
  }
  return {
    ...base,
    instruction: "Listen and choose the picture",
    audio: word.ar,
  };
}

const PICTURE_VARIANTS: readonly PictureVariant[] = [
  "image-ar",
  "ar-image",
  "listen-image",
];

/** A standalone picture quiz over any pool of words; words without a photo are skipped. */
export function buildPictureQuiz(
  pool: readonly Word[],
  seed: number,
  count = 10,
): ChoiceExercise[] {
  const rng = createRng(seed * 104729 + 17);
  const candidates = pictureWords(pool);
  const words = shuffle(
    candidates.length >= OPTION_COUNT ? candidates : PICTURE_POOL,
    rng,
  );
  // The same thing can appear in several lessons (house, water, bread…), so ask about it once.
  const askedImages = new Set<string>();
  const askedMeanings = new Set<string>();
  const asked = words.filter((w) => {
    const src = getWordImage(w.id)!.src;
    const meaning = meaningKey(w);
    if (askedImages.has(src) || askedMeanings.has(meaning)) return false;
    askedImages.add(src);
    askedMeanings.add(meaning);
    return true;
  });
  return asked
    .slice(0, count)
    .map((w, i) =>
      pictureChoice(
        PICTURE_VARIANTS[i % PICTURE_VARIANTS.length]!,
        w,
        words,
        rng,
      ),
    );
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

  // Up to two photo questions per lesson: Arabic for a photo, then a photo for an Arabic word.
  const lessonPictures = take(pictureWords(words), 0, 2);
  const pictureExercises = lessonPictures.map((w, i) =>
    pictureChoice(
      i % 2 === 0 ? "image-ar" : "ar-image",
      w,
      pictureWords(lesson.words),
      rng,
    ),
  );

  // Phrase lessons get fewer (or no) typing items rather than whole sentences to type.
  const typing = take(words.filter(isTypable), 2, 3).map(typingExercise);

  return [
    ...shuffle([...choices, ...pictureExercises], rng),
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
