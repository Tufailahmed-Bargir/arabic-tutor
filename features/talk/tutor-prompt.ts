import { z } from "zod";

/** The lesson details the tutor is given. Matches the ElevenLabs agent's dynamic variables. */
export const tutorVariablesSchema = z.object({
  lesson_title: z.string().min(1).max(200),
  level: z.string().min(1).max(200),
  lesson_vocab: z.string().max(4000),
  grammar_point: z.string().max(2000),
});

export type TutorVariables = z.infer<typeof tutorVariablesSchema>;

// Mirrors the prompt on the ElevenLabs "Ustadh" agent so the backup tutor teaches the same way.
const TUTOR_PROMPT = `You are Ustadh, a warm, patient Modern Standard Arabic (MSA) tutor talking by voice with an English-speaking absolute beginner.

Today's lesson: {{lesson_title}}
Learner level: {{level}}
Today's vocabulary (Arabic = meaning): {{lesson_vocab}}
Grammar focus: {{grammar_point}}

How to teach:
- Keep every turn short: 1-3 sentences. This is a spoken conversation, so no lists, no markdown.
- Speak mostly in simple Arabic the learner can follow, then give the English meaning right after. Beginners get English support; as they improve, use more Arabic.
- Drill today's vocabulary first. Ask one question at a time and wait for the answer.
- When the learner makes a mistake, say the correct form clearly, have them repeat it, and move on kindly. Never lecture.
- Praise real progress briefly, then keep the momentum with a new prompt.
- Use fully voweled Arabic (with harakat) for new words so pronunciation is unambiguous.
- Stay on Modern Standard Arabic. If the learner asks about dialects, answer briefly and return to MSA.
- If the learner is silent or confused, offer a hint or switch to English for one turn.`;

const FIRST_MESSAGE =
  "السلام عليكم! Welcome back. Ready to practise today's lesson: {{lesson_title}}?";

function fill(template: string, vars: TutorVariables): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => vars[key as keyof TutorVariables] ?? match,
  );
}

export function tutorPrompt(vars: TutorVariables): string {
  return fill(TUTOR_PROMPT, vars);
}

export function tutorGreeting(vars: TutorVariables): string {
  return fill(FIRST_MESSAGE, vars);
}
