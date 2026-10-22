import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const signedUrlResponse = z.object({ signed_url: z.string().url() });

const NO_STORE = { "Cache-Control": "no-store" } as const;

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
      return NextResponse.json(
        { error: "The voice service rejected the request." },
        { status: 502, headers: NO_STORE },
      );
    }

    const parsed = signedUrlResponse.safeParse(await upstream.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "The voice service returned an unexpected response." },
        { status: 502, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { mode: "signed", signedUrl: parsed.data.signed_url },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the voice service." },
      { status: 502, headers: NO_STORE },
    );
  }
}
