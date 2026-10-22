"use client";

import { Loader2, SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Type a message first.")
    .max(500, "Keep messages under 500 characters."),
});
type FormValues = z.infer<typeof schema>;

export function TextComposer({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: "" },
  });

  function submit({ text }: FormValues) {
    onSend(text);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-1.5" noValidate>
      <div className="flex gap-2">
        <label htmlFor="talk-message" className="sr-only">
          Type a message to your tutor
        </label>
        <Input
          id="talk-message"
          autoComplete="off"
          placeholder={
            disabled ? "Start a session to type…" : "Or type a message…"
          }
          disabled={disabled || isSubmitting}
          aria-invalid={errors.text ? true : undefined}
          aria-describedby={errors.text ? "talk-message-error" : undefined}
          {...register("text")}
        />
        <Button
          type="submit"
          disabled={disabled || isSubmitting}
          aria-label="Send message"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <SendHorizontal />
          )}
        </Button>
      </div>
      {errors.text && (
        <p
          id="talk-message-error"
          role="alert"
          className="text-destructive text-sm"
        >
          {errors.text.message}
        </p>
      )}
    </form>
  );
}
