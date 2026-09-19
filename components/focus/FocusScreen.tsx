"use client";

import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DriftModal } from "./DriftModal";
import { SessionComplete } from "./SessionComplete";
import { TimerDisplay } from "./TimerDisplay";
import { Button } from "@/components/ui/Button";
import { useActiveSession, useCountdown } from "@/lib/hooks/useActiveSession";
import { countForSession, useDistractions } from "@/lib/hooks/useDistractions";
import { useTasks } from "@/lib/hooks/useTasks";
import { isRunning } from "@/lib/sessions";
import { useHydrated } from "@/lib/store";
import type { Session } from "@/lib/types";

export function FocusScreen() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { active, toggle, pause, resume, finish } = useActiveSession();
  const { distractions, record } = useDistractions();
  const { tasks } = useTasks();
  const [finished, setFinished] = useState<Session | null>(null);
  const [drifting, setDrifting] = useState(false);

  const end = useCallback(() => {
    const completed = finish();
    if (completed) setFinished(completed);
  }, [finish]);

  // Fires from the countdown tick when the clock reaches zero.
  const remaining = useCountdown(active, end);

  // The clock stops the instant the user admits to drifting, before they pick
  // a reason — deliberation time is not focus time.
  const openDrift = useCallback(() => {
    if (!active) return;
    pause();
    setDrifting(true);
  }, [active, pause]);

  const closeDrift = useCallback(() => {
    setDrifting(false);
    resume();
  }, [resume]);

  const sessionId = finished?.id ?? active?.id;
  const returns = countForSession(distractions, sessionId);

  const task = tasks.find((t) => t.id === (finished?.taskId ?? active?.taskId));
  const taskTitle = task?.title ?? "Untitled task";
  const running = active !== null && isRunning(active);

  // No session in progress (direct visit, or finished in another tab).
  useEffect(() => {
    if (hydrated && !active && !finished) router.replace("/");
  }, [hydrated, active, finished, router]);

  useEffect(() => {
    if (!active || drifting) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.isContentEditable))
        return;
      if (event.code === "Space") {
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key === "d" || event.key === "D") {
        event.preventDefault();
        openDrift();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, drifting, toggle, openDrift]);

  if (finished) {
    return (
      <SessionComplete
        session={finished}
        taskTitle={taskTitle}
        distractions={returns}
        onDone={() => router.replace("/")}
      />
    );
  }

  if (!active) return <div className="min-h-dvh" />;

  return (
    <div className="rise flex min-h-dvh flex-col px-5 py-8 sm:px-8 sm:py-12">
      <header className="flex items-start justify-between gap-6">
        <p className="label">In session</p>
        <p className="label tabnum">
          {returns > 0 ? `${returns} return${returns === 1 ? "" : "s"} · ` : ""}
          {Math.round(active.plannedDuration / 60)} min
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-lg">
          <h1 className="mb-14 text-center text-lg text-muted sm:text-xl">
            {taskTitle}
          </h1>

          <TimerDisplay
            remaining={remaining}
            total={active.plannedDuration}
            running={running}
          />

          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={toggle} className="sm:w-32">
              {running ? <Pause size={13} /> : <Play size={13} />}
              {running ? "Pause" : "Resume"}
            </Button>
            <Button variant="default" className="sm:w-40" onClick={openDrift}>
              I&apos;m Drifting
            </Button>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4">
        <div className="hidden items-center gap-3 text-xs text-faint sm:flex">
          <span className="flex items-center gap-2">
            <kbd className="kbd">Space</kbd> pause
          </span>
          <span className="flex items-center gap-2">
            <kbd className="kbd">D</kbd> drifting
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={end}>
          Finish session
        </Button>
      </footer>

      {drifting ? (
        <DriftModal
          onRecord={(reason) => active && record(active.id, reason)}
          onReturn={closeDrift}
          onDismiss={closeDrift}
        />
      ) : null}
    </div>
  );
}
