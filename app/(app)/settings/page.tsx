import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Choose how Arabic text is displayed and manage your saved progress.",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Your progress is saved in this browser only. Clearing site data
          removes it.
        </p>
      </header>
      <SettingsClient />
    </div>
  );
}
