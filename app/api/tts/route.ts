import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const bodySchema = z.object({ text: z.string().trim().min(1).max(300) });

export async function POST(request: Request) {
  if (!env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Server audio is not configured." },
      { status: 501 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide text between 1 and 300 characters." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(env.ELEVENLABS_VOICE_ID)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: parsed.data.text,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "The audio service could not generate speech." },
        { status: 502 },
      );
    }

    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the audio service." },
      { status: 502 },
    );
  }
}
