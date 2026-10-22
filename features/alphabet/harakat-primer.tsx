import { ArabicText } from "@/components/arabic-text";

const SHORT_MARKS = [
  {
    name: "Fatḥa",
    text: "بَ",
    sound: "ba",
    note: "short “a”, a small line above",
  },
  {
    name: "Ḍamma",
    text: "بُ",
    sound: "bu",
    note: "short “u”, a small loop above",
  },
  {
    name: "Kasra",
    text: "بِ",
    sound: "bi",
    note: "short “i”, a small line below",
  },
  {
    name: "Sukūn",
    text: "بْ",
    sound: "b",
    note: "no vowel, a small circle above",
  },
  { name: "Shadda", text: "بّ", sound: "bb", note: "doubles the consonant" },
] as const;

const LONG_VOWELS = [
  { text: "بَا", sound: "bā", note: "fatḥa + alif" },
  { text: "بُو", sound: "bū", note: "ḍamma + waaw" },
  { text: "بِي", sound: "bī", note: "kasra + yaa" },
] as const;

export function HarakatPrimer() {
  return (
    <section aria-labelledby="harakat-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="harakat-heading" className="text-lg font-semibold">
          Vowel marks (ḥarakāt)
        </h2>
        <p className="text-muted-foreground text-sm">
          Arabic spells out consonants and long vowels. Short vowels are small
          marks that books and news usually leave out, but learners rely on
          them.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {SHORT_MARKS.map((mark) => (
          <li
            key={mark.name}
            className="bg-card rounded-xl border p-3 text-center"
          >
            <ArabicText text={mark.text} size="xl" forceHarakat />
            <p className="mt-1 text-sm font-medium">{mark.name}</p>
            <p className="text-muted-foreground text-xs">
              <span className="text-foreground font-medium">{mark.sound}</span>{" "}
              · {mark.note}
            </p>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Long vowels</h3>
        <ul className="grid grid-cols-3 gap-2">
          {LONG_VOWELS.map((v) => (
            <li
              key={v.sound}
              className="bg-card rounded-xl border p-3 text-center"
            >
              <ArabicText text={v.text} size="xl" forceHarakat />
              <p className="mt-1 text-sm font-medium">{v.sound}</p>
              <p className="text-muted-foreground text-xs">{v.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
