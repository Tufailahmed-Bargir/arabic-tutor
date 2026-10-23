/** Role-plays reuse vocabulary from the lessons, so the tutor only asks for words the learner has met. */
export interface Scenario {
  id: string;
  title: string;
  summary: string;
  task: string;
  /** What the learner should manage to do; shown as the mission checklist and given to the tutor. */
  goals: readonly string[];
  /** The lesson whose vocabulary the role-play leans on, used to suggest it at the right time. */
  afterDay: number;
  wordIds: readonly string[];
}

/** Word ids for `day`, by their 1-based position in that lesson. */
function ids(day: number, ...positions: number[]): string[] {
  return positions.map((p) => `d${day}w${p}`);
}

const START = "Start the role-play straight away instead of drilling words.";

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "intro",
    title: "Meeting someone new",
    summary: "Greet, ask a name, say where you are from.",
    task: `You are a friendly local meeting the learner for the first time. Greet them, ask their name and where they are from, and react to their answers. ${START}`,
    goals: [
      "Greet the tutor and answer their greeting",
      "Say your name and ask theirs",
      "Say where you are from",
    ],
    afterDay: 11,
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
  },
  {
    id: "cafe",
    title: "At a café",
    summary: "Order a drink and ask the price.",
    task: `You are a café waiter. Welcome the learner, take an order for drinks or food, and tell them the price in simple numbers. ${START}`,
    goals: ["Order a drink", "Ask how much it costs", "Thank the waiter"],
    afterDay: 15,
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
  },
  {
    id: "directions",
    title: "Asking for places",
    summary: "Ask where a place is.",
    task: `You are a helpful passer-by. The learner asks where a place is; answer with very simple Arabic and an English hint, then let them ask about another place. ${START}`,
    goals: [
      "Ask where a place is",
      "Repeat the answer back",
      "Ask about a second place",
    ],
    afterDay: 21,
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
  },
  {
    id: "market",
    title: "At the market",
    summary: "Ask for things and count.",
    task: `You are a market seller. The learner asks for fruit, bread or other items and how much they cost; reply with simple numbers and colours. ${START}`,
    goals: [
      "Ask for two different items",
      "Ask the price",
      "Say how many you want",
    ],
    afterDay: 24,
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
  },
  {
    id: "small-talk",
    title: "Small talk with a neighbour",
    summary: "How are you, what's new, the weather.",
    task: `You are the learner's friendly neighbour bumping into them in the street. Ask how they are and what's new, mention the weather, and keep the chat light. ${START}`,
    goals: [
      "Ask how your neighbour is and answer back",
      "Say how you feel today",
      "Comment on the weather",
    ],
    afterDay: 30,
    wordIds: [
      ...ids(30, 1, 2, 3, 4, 5, 6, 7),
      ...ids(29, 1, 3, 9),
      ...ids(23, 7, 8),
    ],
  },
  {
    id: "family",
    title: "Describing your family",
    summary: "Who is in your family and what they are like.",
    task: `You are a new friend curious about the learner's family. Ask who is in their family, their names and what they are like, and share a little about your own. ${START}`,
    goals: [
      "Name at least three family members",
      "Describe one of them with an adjective",
      "Ask about the tutor's family",
    ],
    afterDay: 26,
    wordIds: [
      ...ids(13, 1, 2, 3, 4, 5, 6),
      ...ids(26, 6),
      ...ids(20, 1, 2, 3, 6),
    ],
  },
  {
    id: "work",
    title: "Talking about work",
    summary: "Say what you do and where you work.",
    task: `You are meeting the learner at a networking event. Ask what they do, where they work and what their day is like, and tell them about your own job. ${START}`,
    goals: [
      "Say what your job is",
      "Describe where you work",
      "Ask the tutor what they do",
    ],
    afterDay: 55,
    wordIds: [...ids(28, 1, 2, 6, 10), ...ids(55, 1, 2, 3, 4, 5, 6)],
  },
  {
    id: "routine",
    title: "Your daily routine",
    summary: "Walk through your day from morning to night.",
    task: `You are a curious friend. Ask the learner to describe their typical day: when they wake up, eat, work and sleep. Ask follow-up questions about times. ${START}`,
    goals: [
      "Describe five things you do in a day",
      "Give at least two times",
      "Use ثُمَّ (then) or بَعْدَ (after) to link them",
    ],
    afterDay: 37,
    wordIds: [
      ...ids(37, 1, 3, 4, 5, 6, 9, 10),
      ...ids(34, 1, 2),
      ...ids(36, 8, 9),
    ],
  },
  {
    id: "restaurant",
    title: "At a restaurant",
    summary: "Get a table, order a full meal, pay.",
    task: `You are a waiter at a restaurant. Seat the learner, offer the menu, take an order for a main dish and a drink, then bring the bill when asked. ${START}`,
    goals: [
      "Ask for a table",
      "Order a main dish and a drink",
      "Say whether the food is good",
      "Ask for the bill",
    ],
    afterDay: 52,
    wordIds: [
      ...ids(52, 1, 2, 3, 6, 7, 8, 9, 10),
      ...ids(15, 1, 7, 8),
      ...ids(24, 4),
    ],
  },
  {
    id: "clothes",
    title: "Buying clothes",
    summary: "Find an item, check the size, agree a price.",
    task: `You are a shop assistant in a clothes shop. Help the learner find an item, ask about colour and size, tell them the price and offer a small discount if they ask. ${START}`,
    goals: [
      "Ask for an item in a colour",
      "Ask about the size",
      "Ask the price and ask for a discount",
      "Buy it",
    ],
    afterDay: 50,
    wordIds: [
      ...ids(49, 2, 3, 5, 10),
      ...ids(50, 1, 3, 4, 7, 10),
      ...ids(14, 2, 5, 6),
    ],
  },
  {
    id: "taxi",
    title: "Taking a taxi",
    summary: "Give the destination and directions, pay the fare.",
    task: `You are a taxi driver. Ask the learner where they want to go, ask for directions along the way (right, left, straight on), and tell them the fare at the end. ${START}`,
    goals: [
      "Tell the driver where you are going",
      "Give two directions",
      "Ask the fare and pay",
    ],
    afterDay: 47,
    wordIds: [
      ...ids(46, 1, 2, 3, 6, 7),
      ...ids(47, 5, 8),
      ...ids(50, 1),
      ...ids(33, 3),
      ...ids(9, 6),
    ],
  },
  {
    id: "hotel",
    title: "Checking into a hotel",
    summary: "Show your reservation and ask about breakfast.",
    task: `You are a hotel receptionist. Greet the learner, check their reservation and passport, give them a room key and answer questions about breakfast times. ${START}`,
    goals: [
      "Say you have a reservation",
      "Hand over your passport",
      "Ask what time breakfast is",
    ],
    afterDay: 48,
    wordIds: [...ids(48, 1, 2, 3, 4, 5, 9), ...ids(34, 1, 5, 9), ...ids(52, 4)],
  },
  {
    id: "doctor",
    title: "At the doctor",
    summary: "Explain what hurts and follow advice.",
    task: `You are a kind doctor at a clinic. Ask the learner what the problem is, where it hurts and since when, then give simple advice and suggest a medicine from the pharmacy. ${START}`,
    goals: [
      "Say what hurts",
      "Say since when",
      "Understand the advice and thank the doctor",
    ],
    afterDay: 53,
    wordIds: [
      ...ids(53, 2, 3, 4, 5, 6, 7, 10),
      ...ids(22, 1, 6, 7),
      ...ids(36, 1),
    ],
  },
  {
    id: "phone",
    title: "A phone call",
    summary: "Call a friend and arrange to meet.",
    task: `You answer the phone to the learner, who is your friend. Find out who is calling, chat briefly and agree a day and time to meet. ${START}`,
    goals: [
      "Answer the phone and say who you are",
      "Ask how your friend is",
      "Arrange a time to meet",
    ],
    afterDay: 61,
    wordIds: [...ids(61, 1, 2, 4, 5, 6, 7), ...ids(30, 1, 3, 5), ...ids(42, 3)],
  },
  {
    id: "plans",
    title: "Making weekend plans",
    summary: "Suggest an activity, pick a day and time.",
    task: `You are the learner's friend planning the weekend together. Suggest a few activities, ask what they prefer, and agree on a day and time using the future tense. ${START}`,
    goals: [
      "Suggest an activity",
      "Say what you prefer and why",
      "Agree a day and a time using the future",
    ],
    afterDay: 56,
    wordIds: [
      ...ids(42, 1, 3, 4, 7, 9),
      ...ids(17, 6, 7),
      ...ids(56, 3, 4, 8),
      ...ids(31, 2),
      ...ids(34, 1),
    ],
  },
  {
    id: "opinions",
    title: "Sharing opinions",
    summary: "City or countryside? Give and defend a view.",
    task: `Hold a friendly debate with the learner: is it better to live in a big city or in a village? Ask for their opinion, disagree politely sometimes, and ask them to explain why. ${START}`,
    goals: [
      "Give your opinion",
      "Explain why with لِأَنَّ (because)",
      "Agree or disagree with the tutor politely",
      "Compare two things",
    ],
    afterDay: 62,
    wordIds: [
      ...ids(62, 1, 2, 4, 5, 6, 9, 10),
      ...ids(59, 1, 3, 8),
      ...ids(44, 4),
      ...ids(21, 7),
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
