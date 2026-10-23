import { GoogleGenAI, Modality } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  tutorGreeting,
  tutorPrompt,
  tutorVariablesSchema,
} from "@/features/talk/tutor-prompt";
import { GEMINI_API_VERSION, GEMINI_LIVE_MODEL } from "@/features/talk/gemini";
import { env } from "@/lib/env";

const NO_STORE = { "Cache-Control": "no-store" } as const;

const bodySchema = z.object({ variables: tutorVariablesSchema });

/** Issues a single-use Gemini Live token with the tutor prompt locked in, so the API key and prompt stay on the server. */
export async function POST(request: Request) {
  if (!env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "The backup tutor is not configured." },
      { status: 503, headers: NO_STORE },
    );
  }

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid lesson details." },
      { status: 400, headers: NO_STORE },
    );
  }

  const { variables } = body.data;
  const now = Date.now();

  try {
    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: { apiVersion: GEMINI_API_VERSION },
    });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        liveConnectConstraints: {
          model: GEMINI_LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: tutorPrompt(variables),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        },
      },
    });

    if (!token.name) throw new Error("Token response had no name");

    return NextResponse.json(
      { token: token.name, greeting: tutorGreeting(variables) },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the backup tutor." },
      { status: 502, headers: NO_STORE },
    );
  }
}
