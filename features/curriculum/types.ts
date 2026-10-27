import { z } from "zod";

export const wordSchema = z.object({
  id: z.string(),
  ar: z.string().min(1),
  tr: z.string().min(1),
  en: z.string().min(1),
});
export type Word = z.infer<typeof wordSchema>;

export const lessonSchema = z.object({
  day: z.number().int().positive(),
  unit: z.string(),
  title: z.string(),
  titleAr: z.string(),
  objective: z.string(),
  grammar: z.object({ title: z.string(), body: z.string() }).optional(),
  words: z.array(wordSchema).min(4),
});
export type Lesson = z.infer<typeof lessonSchema>;

export interface Letter {
  char: string;
  name: string;
  sound: string;
  /** Right-joining letters never connect to the following letter. */
  joinsNext: boolean;
  example: Omit<Word, "id">;
}
