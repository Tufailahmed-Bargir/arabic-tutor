import type { Metadata } from "next";
import { Suspense } from "react";
import { TalkClient, TalkSkeleton } from "@/features/talk/talk-client";

export const metadata: Metadata = {
  title: "Talk with your tutor",
  description: "Practise today's Arabic lesson out loud with a voice tutor.",
  robots: { index: false, follow: false },
};

export default function TalkPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Talk with your tutor
        </h1>
        <p className="text-muted-foreground">
          Speak Arabic out loud. Your tutor listens, replies, and writes
          everything down.
        </p>
      </header>
      {/* The topic comes from the URL, which is only known at request time. */}
      <Suspense fallback={<TalkSkeleton />}>
        <TalkClient />
      </Suspense>
    </div>
  );
}
