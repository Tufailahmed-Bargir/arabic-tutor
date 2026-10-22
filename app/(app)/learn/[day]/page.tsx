import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
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

function LessonSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading lesson">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

async function LessonContent({ params }: LessonPageProps) {
  const lesson = resolveLesson((await params).day);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Suspense fallback={<LessonSkeleton />}>
        <LessonContent params={params} />
      </Suspense>
    </div>
  );
}
