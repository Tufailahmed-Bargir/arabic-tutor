export const SITE_NAME = "Ustadh";
export const SITE_TAGLINE =
  "Learn Arabic a little every day, and speak it out loud.";
export const SITE_DESCRIPTION =
  "Daily Modern Standard Arabic lessons for beginners, with picture quizzes, spaced-repetition review and a voice tutor you can actually talk to. Arabic is always written out, with diacritics on or off.";

export const ARABIC_FONT_STACK =
  "var(--font-arabic, 'Noto Naskh Arabic', 'Amiri', 'Geeza Pro', serif)";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const FAQ = [
  {
    question: "Which Arabic does this teach?",
    answer:
      "Modern Standard Arabic (Fusha), the written and formal language understood across the Arab world. It is the best foundation for reading, writing and later picking up any dialect.",
  },
  {
    question: "Do I need to know any Arabic already?",
    answer:
      "You only need to know the Arabic letters. The course starts with the vowel marks, then moves through greetings, numbers, family and food to present, past and future verbs, shopping, travel, work, health and giving opinions. A phrasebook and speaking challenges help you practise real conversations.",
  },
  {
    question: "Can I speak with the tutor out loud?",
    answer:
      "Yes. The voice tutor listens through your microphone, replies in spoken Arabic and writes the conversation as text so you can read along. It also knows which lesson you are on.",
  },
  {
    question: "Can I turn the vowel marks off?",
    answer:
      "Yes. Show or hide the short-vowel marks (harakat) anywhere Arabic appears. Keep them on while you learn, then switch them off to practise reading real-world text.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Your streak, progress and review schedule are stored privately in your browser.",
  },
] as const;
