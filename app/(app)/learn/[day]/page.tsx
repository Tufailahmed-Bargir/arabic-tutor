import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getLesson, LESSONS } from "@/features/curriculum/lessons";
import { LessonPlayer } from "@/features/learn/lesson-player";

interface LessonPageProps {
  params: Promise<{ day: string }>;
}

function resolveLesson(day: string) {
  return /^\d+$/.test(day) ? getLesson(Number(day)) : undefined;
}

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ day: String(lesson.day) }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const lesson = resolveLesson((await params).day);
  if (!lesson)
    return {
      title: "Lesson not found",
      robots: { index: false, follow: false },
    };
  return {
    title: `Day ${lesson.day}: ${lesson.title}`,
    description: lesson.objective,
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = resolveLesson((await params).day);
  if (!lesson) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <LessonPlayer lesson={lesson} />
    </div>
  );
}
