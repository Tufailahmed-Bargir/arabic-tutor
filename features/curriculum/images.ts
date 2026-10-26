import { IMAGES as A } from "./images/set-a";
import { IMAGES as B } from "./images/set-b";
import { IMAGES as C } from "./images/set-c";

const IMAGES: Record<string, string> = { ...A, ...B, ...C };

/** Remote picture for a concrete word (house, book, water…), if one is curated. */
export function getWordImage(wordId: string): string | undefined {
  return IMAGES[wordId];
}
