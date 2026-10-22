import type { Metadata } from "next";
import { BottomNav, SidebarNav } from "@/components/app-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <SidebarNav />
      <div className="min-w-0 flex-1 pb-24 md:pb-0">
        <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
