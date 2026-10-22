import type { Metadata } from "next";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your streak, today’s Arabic lesson and flashcards due for review.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <DashboardClient />
    </div>
  );
}
