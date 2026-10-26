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
export function getWordImage(wordId: string): WordImage | undefined {
  const src = IMAGES[wordId];
  if (!src) return undefined;
  const url = new URL(src);
  if (url.hostname !== COMMONS_HOST) return { src, unoptimized: false };
  const name = commonsFileName(url);
  return {
    src,
    unoptimized: true,
    credit: name ? COMMONS_CREDITS[name] : undefined,
  };
}

export function commonsCredits(): [file: string, credit: ImageCredit][] {
  return Object.entries(COMMONS_CREDITS);
}
