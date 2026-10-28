"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mic } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSurah, SURAHS } from "./quran";
import { SurahMap } from "./surah-map";

const schema = z
  .object({
    surah: z.coerce.number().int().min(1).max(114),
    from: z.coerce
      .number({ error: "Enter an ayah number." })
      .int()
      .min(1, "Ayat start at 1."),
    to: z.coerce
      .number({ error: "Enter an ayah number." })
      .int()
      .min(1, "Ayat start at 1."),
  })
  .superRefine((values, ctx) => {
    const ayahs = getSurah(values.surah)?.ayahs ?? 0;
    if (values.from > ayahs) {
      ctx.addIssue({
        code: "custom",
        path: ["from"],
        message: `This surah has ${ayahs} ayat.`,
      });
    }
    if (values.to > ayahs) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: `This surah has ${ayahs} ayat.`,
      });
    }
    if (values.to < values.from) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "End at or after the first ayah.",
      });
    }
  });

type FormInput = z.input<typeof schema>;
export type Passage = z.output<typeof schema>;

interface SetupFormProps {
  defaultValues: Passage;
  /** Loads the passage and starts listening; resolves when the attempt is over. */
  onStart: (passage: Passage) => Promise<void>;
  disabled?: boolean;
}

const selectClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-11 w-full rounded-lg border bg-transparent px-2.5 text-base outline-none focus-visible:ring-3 disabled:opacity-50 md:text-sm";

export function SetupForm({
  defaultValues,
  onStart,
  disabled,
}: SetupFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, Passage>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const surahId = Number(useWatch({ control, name: "surah" }));
  const surah = getSurah(surahId);
  const busy = isSubmitting || disabled;

  const surahField = register("surah", {
    onChange: (e: { target: { value: string } }) => {
      const next = getSurah(Number(e.target.value));
      setValue("from", 1);
      setValue("to", next?.ayahs ?? 1);
    },
  });

  function pickAyah(ayah: number) {
    setValue("from", ayah, { shouldValidate: true });
    setValue("to", ayah, { shouldValidate: true });
  }

  return (
    <form
      onSubmit={handleSubmit(onStart)}
      noValidate
      className="bg-card space-y-5 rounded-2xl border p-4 shadow-sm sm:p-6"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="col-span-2 space-y-1.5 sm:col-span-1">
          <label htmlFor="hifz-surah" className="text-sm font-medium">
            Surah
          </label>
          <select
            id="hifz-surah"
            className={selectClass}
            disabled={busy}
            {...surahField}
          >
            {SURAHS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name} · {s.arabic} ({s.ayahs})
              </option>
            ))}
          </select>
        </div>
        <RangeField
          id="hifz-from"
          label="From ayah"
          error={errors.from?.message}
          disabled={busy}
          max={surah?.ayahs}
          {...register("from")}
        />
        <RangeField
          id="hifz-to"
          label="To ayah"
          error={errors.to?.message}
          disabled={busy}
          max={surah?.ayahs}
          {...register("to")}
        />
      </div>

      {surah && <SurahMap surah={surah} onPick={busy ? undefined : pickAyah} />}

      <div className="flex flex-col items-center gap-2 pt-1">
        <Button
          type="submit"
          size="lg"
          className="h-12 min-w-52 px-6"
          disabled={busy}
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <Mic aria-hidden />
          )}
          {isSubmitting ? "Preparing…" : "Start reciting"}
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          The text stays hidden. Each word appears as you recite it correctly.
        </p>
      </div>
    </form>
  );
}

interface RangeFieldProps extends React.ComponentProps<"input"> {
  id: string;
  label: string;
  error?: string;
}

function RangeField({
  id,
  label,
  error,
  className,
  ...props
}: RangeFieldProps) {
  return (
    <div className="space-y-1.5 sm:w-28">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn("h-11 tabular-nums", className)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
