/** Role-plays reuse vocabulary from the lessons, so the tutor only asks for words the learner has met. */
export interface Scenario {
  id: string;
  title: string;
  summary: string;
  task: string;
  wordIds: readonly string[];
  /** Lessons the vocabulary comes from, shown as a hint. */
  fromDays: readonly number[];
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "intro",
    title: "Meeting someone new",
    summary: "Greet, ask a name, say where you are from.",
    task: "You are a friendly local meeting the learner for the first time. Greet them, ask their name and where they are from, and react to their answers. Start the role-play straight away instead of drilling words.",
    wordIds: [
      "d9w1",
      "d9w2",
      "d9w3",
      "d11w1",
      "d11w2",
      "d11w3",
      "d11w6",
      "d11w7",
      "d11w8",
      "d10w1",
    ],
    fromDays: [9, 10, 11],
  },
  {
    id: "cafe",
    title: "At a café",
    summary: "Order a drink and ask the price.",
    task: "You are a café waiter. Welcome the learner, take an order for drinks or food, and tell them the price in simple numbers. Start the role-play straight away instead of drilling words.",
    wordIds: [
      "d15w1",
      "d15w3",
      "d15w4",
      "d15w5",
      "d24w4",
      "d24w3",
      "d9w6",
      "d24w8",
      "d12w1",
      "d12w2",
      "d12w3",
    ],
    fromDays: [9, 12, 15, 24],
  },
  {
    id: "directions",
    title: "Asking for places",
    summary: "Ask where a place is.",
    task: "You are a helpful passer-by. The learner asks where a place is; answer with very simple Arabic and an English hint, then let them ask about another place. Start the role-play straight away instead of drilling words.",
    wordIds: [
      "d18w3",
      "d21w1",
      "d21w2",
      "d21w3",
      "d21w4",
      "d21w5",
      "d21w6",
      "d21w8",
      "d9w6",
    ],
    fromDays: [9, 18, 21],
  },
  {
    id: "market",
    title: "At the market",
    summary: "Ask for things and count.",
    task: "You are a market seller. The learner asks for fruit, bread or other items and how much they cost; reply with simple numbers and colours. Start the role-play straight away instead of drilling words.",
    wordIds: [
      "d24w3",
      "d24w4",
      "d15w2",
      "d15w6",
      "d15w7",
      "d12w4",
      "d12w5",
      "d12w10",
      "d14w1",
      "d14w3",
    ],
    fromDays: [12, 14, 15, 24],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
