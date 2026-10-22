"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ArabicText } from "@/components/arabic-text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { progressActions, useProgress } from "@/features/progress/use-progress";

const prefsSchema = z.object({
  showHarakat: z.boolean(),
  showTranslit: z.boolean(),
});
type PrefsValues = z.infer<typeof prefsSchema>;

const OPTIONS = [
  {
    name: "showHarakat",
    label: "Show vowel marks (ḥarakāt)",
    hint: "Display short-vowel marks on Arabic text. Recommended while you are learning.",
  },
  {
    name: "showTranslit",
    label: "Show transliteration",
    hint: "Display a Latin-letter reading under Arabic words.",
  },
] as const;

function PrefsForm({ defaults }: { defaults: PrefsValues }) {
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<PrefsValues>({
    resolver: zodResolver(prefsSchema),
    values: defaults,
  });
  const showHarakat = useWatch({ control, name: "showHarakat" });

  async function onSubmit(values: PrefsValues) {
    try {
      progressActions.setPrefs(values);
      toast.success("Display settings saved");
    } catch {
      toast.error("Could not save your settings. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>
            Choose how Arabic text appears across the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {OPTIONS.map((option) => (
            <Controller
              key={option.name}
              name={option.name}
              control={control}
              render={({ field }) => (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <label
                      htmlFor={option.name}
                      className="text-sm font-medium"
                    >
                      {option.label}
                    </label>
                    <p
                      id={`${option.name}-hint`}
                      className="text-muted-foreground text-xs"
                    >
                      {option.hint}
                    </p>
                  </div>
                  <Switch
                    id={option.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    aria-describedby={`${option.name}-hint`}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            />
          ))}

          <div
            className="bg-muted/40 rounded-xl border p-4 text-center"
            aria-live="polite"
          >
            <p className="text-muted-foreground mb-1 text-xs">Preview</p>
            <ArabicText
              text="السَّلَامُ عَلَيْكُمْ"
              size="xl"
              forceHarakat={showHarakat}
            />
          </div>

          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            )}
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function ResetCard() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function confirmReset() {
    setBusy(true);
    try {
      progressActions.reset();
      toast.success("Progress reset. You can start fresh.");
      setOpen(false);
    } catch {
      toast.error("Could not reset your progress. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your data</CardTitle>
        <CardDescription>
          Lessons, streaks and flashcards are stored only in this browser. There
          is no account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          <Trash2 data-icon="inline-start" />
          Reset all progress
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all progress?</DialogTitle>
            <DialogDescription>
              This permanently deletes your completed lessons, streak and
              flashcards from this browser. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReset}
              disabled={busy}
            >
              {busy && (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              )}
              Yes, reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function SettingsClient() {
  const progress = useProgress();

  if (!progress) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading settings">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PrefsForm defaults={progress.prefs} />
      <ResetCard />
    </div>
  );
}
