"use client";

import { useMemo } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import {
  AlertTriangle,
  BookOpen,
  Keyboard,
  Mic,
  MicOff,
  PhoneOff,
  ShieldAlert,
} from "lucide-react";
import { ArabicText } from "@/components/arabic-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "@/features/progress/use-progress";
import { buildTalkContext, type TalkContext } from "./lesson-context";
import { MicOrb, orbLabel, type OrbState } from "./mic-orb";
import { TextComposer } from "./text-composer";
import { Transcript } from "./transcript";
import { useTalkSession, type TalkError } from "./use-talk-session";

function LessonContextCard({ context }: { context: TalkContext }) {
  const { lesson } = context;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            Today&apos;s focus
          </CardTitle>
          <Badge variant="secondary">Day {lesson.day}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{lesson.title}</p>
          <p className="text-muted-foreground text-sm">{lesson.objective}</p>
        </div>
        <ul
          className="flex flex-wrap gap-2"
          aria-label="Words your tutor will practise"
        >
          {lesson.words.slice(0, 6).map((w) => (
            <li
              key={w.id}
              className="bg-muted/40 rounded-lg border px-2.5 py-1"
            >
              <ArabicText text={w.ar} size="md" />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-xs">
          Your tutor knows this lesson and will drill it with you.
        </p>
      </CardContent>
    </Card>
  );
}

function ErrorPanel({
  error,
  onRetry,
}: {
  error: TalkError;
  onRetry: () => void;
}) {
  const denied = error.kind === "mic-denied";
  const Icon = denied
    ? MicOff
    : error.kind === "insecure"
      ? ShieldAlert
      : AlertTriangle;

  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-4 text-sm"
    >
      <div className="flex items-start gap-3">
        <Icon
          className="text-destructive mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-medium">{error.message}</p>
          {denied && (
            <p className="text-muted-foreground">
              Click the lock icon in your browser&apos;s address bar, allow the
              microphone for this site, then try again. You can also chat by
              text.
            </p>
          )}
          {error.kind === "session" && (
            <p className="text-muted-foreground">
              Check your connection and try again.
            </p>
          )}
        </div>
      </div>
      <div>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function TalkSession({ context }: { context: TalkContext }) {
  const session = useTalkSession(context);
  const { status, mode, preparing, textOnly, isMuted, error } = session;

  const connected = status === "connected";
  const connecting = preparing || status === "connecting";
  const busy = connecting || connected;

  const orbState: OrbState = connecting
    ? "connecting"
    : !connected
      ? "idle"
      : textOnly
        ? "idle"
        : isMuted
          ? "muted"
          : mode === "speaking"
            ? "speaking"
            : "listening";

  const statusText =
    connected && textOnly ? "Text chat is open" : orbLabel(orbState);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <aside className="space-y-4">
        <LessonContextCard context={context} />
      </aside>

      <section aria-label="Conversation" className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <MicOrb state={orbState} />
            <p aria-live="polite" className="text-sm font-medium">
              {statusText}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {!busy ? (
                <>
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => session.start({ textOnly: false })}
                  >
                    <Mic />
                    Start talking
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={() => session.start({ textOnly: true })}
                  >
                    <Keyboard />
                    Chat by text
                  </Button>
                </>
              ) : (
                <>
                  {!textOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!connected}
                      aria-pressed={isMuted}
                      onClick={() => session.setMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff /> : <Mic />}
                      {isMuted ? "Unmute" : "Mute"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={session.stop}
                    disabled={connecting}
                  >
                    <PhoneOff />
                    End session
                  </Button>
                </>
              )}
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Voice needs a microphone and a secure connection (HTTPS or
              localhost).
            </p>
          </CardContent>
        </Card>

        {error && (
          <ErrorPanel
            error={error}
            onRetry={() =>
              session.start({
                textOnly: error.kind === "mic-denied" ? false : textOnly,
              })
            }
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Transcript messages={session.messages} live={connected} />
            <TextComposer disabled={!connected} onSend={session.send} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TalkSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]" aria-busy="true">
      <Skeleton className="h-56 rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function TalkClient() {
  const progress = useProgress();
  const context = useMemo(
    () =>
      progress
        ? buildTalkContext(new Set(Object.keys(progress.completed).map(Number)))
        : null,
    [progress],
  );

  if (!context) return <TalkSkeleton />;

  return (
    <ConversationProvider>
      <TalkSession context={context} />
    </ConversationProvider>
  );
}
