import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const signedUrlResponse = z.object({ signed_url: z.string().url() });

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** Sends the client to the Gemini backup tutor when it is configured, otherwise reports the ElevenLabs failure. */
function unavailable(error: string) {
  if (env.GEMINI_API_KEY) {
    return NextResponse.json({ mode: "gemini" }, { headers: NO_STORE });
  }
  return NextResponse.json({ error }, { status: 502, headers: NO_STORE });
}

export async function GET() {
  // Signed URLs are short-lived, so this must never be prerendered at build time.
  await connection();

  if (!env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { mode: "public", agentId: env.ELEVENLABS_AGENT_ID },
      { headers: NO_STORE },
    );
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(env.ELEVENLABS_AGENT_ID)}`,
      {
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
        cache: "no-store",
      },
    );

    if (!upstream.ok) {
      return unavailable("The voice service rejected the request.");
    }

    const parsed = signedUrlResponse.safeParse(await upstream.json());
    if (!parsed.success) {
      return unavailable("The voice service returned an unexpected response.");
    }

    return NextResponse.json(
      { mode: "signed", signedUrl: parsed.data.signed_url },
      { headers: NO_STORE },
    );
  } catch {
    return unavailable("Could not reach the voice service.");
  }
}
