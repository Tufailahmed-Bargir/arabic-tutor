import { COMMONS_CREDITS, type ImageCredit } from "./images/credits";
import { IMAGES as A } from "./images/set-a";
import { IMAGES as B } from "./images/set-b";
import { IMAGES as C } from "./images/set-c";

const IMAGES: Record<string, string> = { ...A, ...B, ...C };

const COMMONS_HOST = "upload.wikimedia.org";

export interface WordImage {
  src: string;
  /** Wikimedia rate-limits the server-side optimizer, so the browser loads those directly. */
  unoptimized: boolean;
  /** Present for Wikimedia Commons photos, which require attribution. */
  credit?: ImageCredit;
}

function commonsFileName(url: URL): string | undefined {
  const segment = url.pathname.split("/")[6];
  return segment ? decodeURIComponent(segment) : undefined;
}

/** Remote picture for a concrete word (house, book, water…), if one is curated. */
export function getWordImage(
  wordId: string,
  size: "small" | "large" = "small",
): WordImage | undefined {
  const stored = IMAGES[wordId];
  if (!stored) return undefined;
  const url = new URL(stored);
  if (url.hostname !== COMMONS_HOST) return { src: stored, unoptimized: false };
  const name = commonsFileName(url);
  // Commons serves fixed thumbnail steps: 250px suits small tiles, 500px suits big prompts.
  const src = size === "large" ? stored.replace("/250px-", "/500px-") : stored;
  return {
    src,
    unoptimized: true,
    credit: name ? COMMONS_CREDITS[name] : undefined,
  };
}

export function commonsCredits(): [file: string, credit: ImageCredit][] {
  return Object.entries(COMMONS_CREDITS);
}
