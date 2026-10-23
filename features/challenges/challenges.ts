import { LESSONS, TOTAL_LESSONS } from "@/features/curriculum/lessons";
import type { Lesson, Word } from "@/features/curriculum/types";
import {
  buildQuiz,
  createRng,
  shuffle,
  type Exercise,
} from "@/features/learn/exercises";
import { SCENARIOS } from "@/features/talk/scenarios";
import type { ProgressState } from "@/lib/storage";

/** A checkpoint counts as passed at this score; missions are self-reported and stored as 100. */
export const PASS_MARK = 80;

const CHECKPOINT_WORDS = 12;

export interface Checkpoint {
  id: string;
  unit: string;
  firstDay: number;
  lastDay: number;
  words: readonly Word[];
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** One checkpoint per unit, in course order. Units are contiguous blocks of days. */
export const CHECKPOINTS: readonly Checkpoint[] = LESSONS.reduce<Checkpoint[]>(
  (out, lesson) => {
    const last = out.at(-1);
    if (last?.unit === lesson.unit) {
      last.lastDay = lesson.day;
      last.words = [...last.words, ...lesson.words];
    } else {
      out.push({
        id: `checkpoint:${slug(lesson.unit)}`,
        unit: lesson.unit,
        firstDay: lesson.day,
        lastDay: lesson.day,
        words: lesson.words,
      });
    }
    return out;
  },
  [],
);

export function missionId(scenarioId: string): string {
  return `mission:${scenarioId}`;
}

/** A mixed quiz over a sample of the unit's words, reusing the lesson quiz engine. */
export function buildCheckpointQuiz(
  checkpoint: Checkpoint,
  seed: number,
): Exercise[] {
  const index = CHECKPOINTS.indexOf(checkpoint);
  const rng = createRng(seed * 104729 + index);
  const lesson: Lesson = {
    // Outside the course's day range, so seeds and exercise ids never collide with a lesson's.
    day: 1000 + index,
    unit: checkpoint.unit,
    title: `${checkpoint.unit} checkpoint`,
    titleAr: "اِخْتِبَار",
    objective: `Mixed review of days ${checkpoint.firstDay}–${checkpoint.lastDay}.`,
    words: shuffle(checkpoint.words, rng).slice(0, CHECKPOINT_WORDS),
  };
  return buildQuiz(lesson, seed);
}

export function checkpointProgress(
  checkpoint: Checkpoint,
  completed: ProgressState["completed"],
): { done: number; total: number } {
  let done = 0;
  for (let day = checkpoint.firstDay; day <= checkpoint.lastDay; day++) {
    if (completed[String(day)]) done++;
  }
  return { done, total: checkpoint.lastDay - checkpoint.firstDay + 1 };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  value: number;
  target: number;
}

export function isEarned(a: Achievement): boolean {
  return a.value >= a.target;
}

export function achievements(s: ProgressState): Achievement[] {
  const lessons = Object.keys(s.completed).length;
  const alphabet = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (d) => s.completed[String(d)],
  ).length;
  const passed = CHECKPOINTS.filter(
    (c) => (s.challenges[c.id]?.score ?? 0) >= PASS_MARK,
  ).length;
  const missions = SCENARIOS.filter(
    (sc) => s.challenges[missionId(sc.id)],
  ).length;
  const words = Object.keys(s.cards).length;
  const streak = s.streak.longest;
  const half = Math.ceil(TOTAL_LESSONS / 2);

  return [
    {
      id: "first-lesson",
      title: "First step",
      description: "Finish your first lesson",
      value: lessons,
      target: 1,
    },
    {
      id: "alphabet",
      title: "Letter perfect",
      description: "Finish the alphabet and vowel lessons",
      value: alphabet,
      target: 8,
    },
    {
      id: "ten-lessons",
      title: "On a roll",
      description: "Finish 10 lessons",
      value: lessons,
      target: 10,
    },
    {
      id: "halfway",
      title: "Halfway there",
      description: `Finish ${half} lessons`,
      value: lessons,
      target: half,
    },
    {
      id: "graduate",
      title: "Graduate",
      description: `Finish all ${TOTAL_LESSONS} lessons`,
      value: lessons,
      target: TOTAL_LESSONS,
    },
    {
      id: "streak-3",
      title: "Warming up",
      description: "Practise 3 days in a row",
      value: streak,
      target: 3,
    },
    {
      id: "streak-7",
      title: "One full week",
      description: "Practise 7 days in a row",
      value: streak,
      target: 7,
    },
    {
      id: "streak-30",
      title: "Habit formed",
      description: "Practise 30 days in a row",
      value: streak,
      target: 30,
    },
    {
      id: "words-50",
      title: "Word collector",
      description: "Have 50 words in review",
      value: words,
      target: 50,
    },
    {
      id: "words-250",
      title: "Growing vocabulary",
      description: "Have 250 words in review",
      value: words,
      target: 250,
    },
    {
      id: "talk-1",
      title: "First words out loud",
      description: "Have a conversation with your tutor",
      value: s.talkSessions,
      target: 1,
    },
    {
      id: "talk-20",
      title: "Chatterbox",
      description: "Have 20 tutor conversations",
      value: s.talkSessions,
      target: 20,
    },
    {
      id: "checkpoint-1",
      title: "Checkpoint cleared",
      description: `Score ${PASS_MARK}% or more on a unit checkpoint`,
      value: passed,
      target: 1,
    },
    {
      id: "checkpoint-all",
      title: "Every unit mastered",
      description: "Pass every unit checkpoint",
      value: passed,
      target: CHECKPOINTS.length,
    },
    {
      id: "missions-3",
      title: "Out in the world",
      description: "Complete 3 speaking missions",
      value: missions,
      target: 3,
    },
    {
      id: "missions-all",
      title: "Ready for anything",
      description: "Complete every speaking mission",
      value: missions,
      target: SCENARIOS.length,
    },
  ];
}
