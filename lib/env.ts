import "server-only";
import { z } from "zod";

const schema = z.object({
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_AGENT_ID: z.string().min(1),
  ELEVENLABS_VOICE_ID: z.string().min(1).default("cjVigY5qzO86Huf0OWal"),
});

export const env = schema.parse({
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || undefined,
  ELEVENLABS_AGENT_ID: process.env.ELEVENLABS_AGENT_ID,
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || undefined,
});
