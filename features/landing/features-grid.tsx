import {
  AudioLines,
  BookOpenCheck,
  CalendarCheck,
  Languages,
  Repeat,
  ImageIcon,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "A lesson every day",
    body: "Short, focused lessons that build on each other. Learn, listen, then prove it in a quick quiz. Your streak keeps you honest.",
  },
  {
    icon: ImageIcon,
    title: "Learn from pictures",
    body: "Real photos for everyday words, plus picture quizzes: pick the Arabic word for a photo, find the photo for a word, or listen and choose.",
  },
  {
    icon: AudioLines,
    title: "A tutor you can talk to",
    body: "Speak out loud and get a spoken reply. Your tutor drills the exact words from today's lesson and corrects you kindly.",
  },
  {
    icon: Repeat,
    title: "Spaced-repetition review",
    body: "Every word you learn joins a smart review deck that brings it back just before you would forget it.",
  },
  {
    icon: Languages,
    title: "Arabic you can read",
    body: "Real Arabic script everywhere, with transliteration and English alongside. Turn diacritics on or off whenever you like.",
  },
  {
    icon: BookOpenCheck,
    title: "Grammar in plain English",
    body: "One clear grammar idea per lesson, taught through the words you just learned, never a wall of rules.",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-t"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl space-y-3">
          <h2
            id="features-heading"
            className="text-3xl font-semibold tracking-tight"
          >
            Everything you need to start speaking
          </h2>
          <p className="text-muted-foreground">
            Built around how beginners actually learn Arabic: script first, then
            sounds, then conversation.
          </p>
        </div>
        <ul className="bg-border mt-12 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-background space-y-3 p-6">
              <span className="bg-muted/50 flex size-9 items-center justify-center rounded-lg border">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="font-medium">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
