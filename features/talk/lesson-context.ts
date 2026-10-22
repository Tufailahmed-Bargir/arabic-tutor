import { LESSONS, getWord } from "@/features/curriculum/lessons";
import type { Word } from "@/features/curriculum/types";
import type { ProgressState } from "@/lib/storage";
import { SCENARIOS, getScenario } from "./scenarios";

export interface TalkTopic {
  id: string;
  kind: "lesson" | "scenario";
  label: string;
}

export interface TalkContext {
  topic: TalkTopic;
  heading: string;
  summary: string;
  badge: string;
  words: Word[];
  dynamicVariables: {
    lesson_title: string;
    level: string;
    lesson_vocab: string;
    grammar_point: string;
  };
}

function levelFor(completedCount: number): string {
  if (completedCount < 8)
    return "Absolute beginner, still learning the letters and sounds";
  if (completedCount < 16)
    return "Beginner, can read letters and knows basic phrases";
  return "Advanced beginner, ready for short sentences";
}

const lessonTopicId = (day: number) => `lesson-${day}`;

/** Topics the learner can pick: every lesson they have reached, then the role-plays. */
export function listTopics(completed: ProgressState["completed"]): {
  lessons: TalkTopic[];
  scenarios: TalkTopic[];
} {
  const done = new Set(Object.keys(completed).map(Number));
  const reached = LESSONS.filter(
    (l) => l.day === 1 || done.has(l.day) || done.has(l.day - 1),
  );
  return {
    lessons: reached.map((l) => ({
      id: lessonTopicId(l.day),
      kind: "lesson",
      label: `Day ${l.day}: ${l.title}`,
    })),
    scenarios: SCENARIOS.map((s) => ({
      id: `scenario-${s.id}`,
      kind: "scenario",
      label: s.title,
    })),
  };
}

/** The lesson finished most recently, so the tutor drills words already studied. */
export function defaultTopicId(completed: ProgressState["completed"]): string {
  const latest = Object.entries(completed).sort(([, a], [, b]) =>
    b.completedAt.localeCompare(a.completedAt),
  )[0];
  return lessonTopicId(latest ? Number(latest[0]) : 1);
}

function vocabLine(words: readonly Word[]): string {
  return words.map((w) => `${w.ar} (${w.tr}) = ${w.en}`).join("; ");
}

export function buildTalkContext(
  completed: ProgressState["completed"],
  topicId: string | null,
): TalkContext {
  const level = levelFor(Object.keys(completed).length);
  const id = topicId ?? defaultTopicId(completed);

  const scenario = id.startsWith("scenario-")
    ? getScenario(id.slice("scenario-".length))
    : undefined;

  if (scenario) {
    const words = scenario.wordIds
      .map((wid) => getWord(wid))
      .filter((w): w is Word => w !== undefined);
    return {
      topic: { id, kind: "scenario", label: scenario.title },
      heading: scenario.title,
      summary: scenario.summary,
      badge: "Role-play",
      words,
      dynamicVariables: {
        lesson_title: `Role-play: ${scenario.title}`,
        level,
        lesson_vocab: vocabLine(words),
        grammar_point: `Role-play task: ${scenario.task}`,
      },
    };
  }

  const day = Number(id.replace("lesson-", ""));
  const lesson = LESSONS.find((l) => l.day === day) ?? LESSONS[0]!;
  return {
    topic: {
      id: lessonTopicId(lesson.day),
      kind: "lesson",
      label: `Day ${lesson.day}: ${lesson.title}`,
    },
    heading: lesson.title,
    summary: lesson.objective,
    badge: `Day ${lesson.day}`,
    words: lesson.words,
    dynamicVariables: {
      lesson_title: `Day ${lesson.day}: ${lesson.title}`,
      level,
      lesson_vocab: vocabLine(lesson.words),
      grammar_point: lesson.grammar
        ? `${lesson.grammar.title}: ${lesson.grammar.body}`
        : "No special grammar focus today",
    },
  };
}
