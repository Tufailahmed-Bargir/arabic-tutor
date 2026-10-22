import { addDays } from "@/lib/date";

export interface Card {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
  due: string;
}

/** 0 = forgot, 3 = hard, 4 = good, 5 = easy (SM-2 quality scale). */
export type Rating = 0 | 3 | 4 | 5;

export const MIN_EASE = 1.3;

export function newCard(today: string): Card {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today };
}

export function review(card: Card, rating: Rating, today: string): Card {
  if (rating < 3) {
    return {
      ...card,
      reps: 0,
      lapses: card.lapses + 1,
      interval: 1,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      due: addDays(today, 1),
    };
  }

  const reps = card.reps + 1;
  const interval =
    reps === 1 ? 1 : reps === 2 ? 3 : Math.round(card.interval * card.ease);
  const ease = Math.max(
    MIN_EASE,
    card.ease + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)),
  );

  return { ...card, reps, interval, ease, due: addDays(today, interval) };
}

export function isDue(card: Card, today: string): boolean {
  return card.due <= today;
}
