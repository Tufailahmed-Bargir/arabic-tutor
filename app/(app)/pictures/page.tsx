import type { Metadata } from "next";
import { PicturesClient } from "@/features/pictures/pictures-client";

export const metadata: Metadata = {
  title: "Picture quiz",
  description:
    "Learn Arabic words from photos: name the picture, choose its Arabic word or find the matching picture.",
  robots: { index: false, follow: false },
};

export default function PicturesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Picture quiz
        </h1>
        <p className="text-muted-foreground text-sm">
          Words stick faster with a face. Guess what each photo is called.
        </p>
      </header>
      <PicturesClient />
    </div>
  );
}
