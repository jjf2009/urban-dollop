"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { DurationPicker } from "@/components/focus/DurationPicker";
import { DistractionBreakdown } from "@/components/stats/DistractionBreakdown";
import { TodayStats } from "@/components/stats/TodayStats";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { useActiveSession } from "@/lib/hooks/useActiveSession";
import { useSaveError } from "@/lib/store";
import { useDayStats } from "@/lib/hooks/useDayStats";
import { useDuration } from "@/lib/hooks/useDuration";
import { useTasks } from "@/lib/hooks/useTasks";

function formatToday(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function Dashboard() {
  const router = useRouter();
  const { tasks, hydrated, addTask, toggleTask, deleteTask } = useTasks();
  const { active, start } = useActiveSession();
  const [duration, setDuration] = useDuration();
  const stats = useDayStats();
  const saveError = useSaveError();

  // The server has no access to the local date, so render it only after hydration.
  const today = hydrated ? formatToday(new Date()) : "";

  const startFocus = useCallback(
    (taskId: string) => {
      start(taskId, duration);
      router.push("/focus");
    },
    [start, duration, router],
  );

  const firstOpenTask = tasks.find((t) => !t.completed);

  // A session left running (refresh, closed tab) resumes where it was.
  useEffect(() => {
    if (hydrated && active) router.replace("/focus");
  }, [hydrated, active, router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.isContentEditable)) return;
      if (event.code === "Space" && firstOpenTask) {
        event.preventDefault();
        startFocus(firstOpenTask.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [firstOpenTask, startFocus]);

  return (
    <div className="relative min-h-dvh">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[420px]" />

      <main className="rise relative mx-auto w-full max-w-2xl px-5 py-14 sm:px-8 sm:py-24">
        <header className="mb-16 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-mono text-[13px] font-medium tracking-[0.24em] text-fg">
              FOCUS<span className="text-faint">{"//"}</span>MODE
            </h1>
            <p className="mt-2.5 h-5 text-sm text-muted">{today}</p>
          </div>
          <p className="hidden max-w-[13rem] text-right text-xs leading-relaxed text-faint sm:block">
            Focus is not never getting distracted.
            <br />
            Focus is returning.
          </p>
        </header>

        {saveError ? (
          <p
            role="status"
            className="mb-8 rounded-[3px] border border-[#3a1e1e] bg-[#1a1010] px-3 py-2 text-xs text-danger"
          >
            Could not write data/focusmode.json — changes are in memory only.
          </p>
        ) : null}

        <Section label="Today">
          <TaskList
            tasks={tasks}
            hydrated={hydrated}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onStart={startFocus}
          />
        </Section>

        <Section label="Focus Today">
          <TodayStats stats={stats} />
        </Section>

        {stats.breakdown.length > 0 ? (
          <Section label="Distractions">
            <DistractionBreakdown breakdown={stats.breakdown} />
          </Section>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="primary"
              size="lg"
              className="group w-full sm:w-auto"
              disabled={!firstOpenTask}
              onClick={() => firstOpenTask && startFocus(firstOpenTask.id)}
            >
              Start Focus
              <ArrowRight
                size={14}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </Button>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>
          <div className="hidden items-center gap-2 text-xs text-faint sm:flex">
            <kbd className="kbd">Space</kbd>
            <span>to start</span>
          </div>
        </div>
      </main>
    </div>
  );
}
