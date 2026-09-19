import type { DistractionEvent, Session, Task } from "./types";

export type DayStats = {
  /** whole minutes, rounded down */
  focusedMinutes: number;
  sessions: number;
  returns: number;
  tasksCompleted: number;
  /** reasons sorted by count, highest first */
  breakdown: { reason: string; count: number }[];
};

/** Local calendar day key, e.g. "2026-09-19". Local, not UTC — the user's day. */
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isSameDay(iso: string, key: string): boolean {
  const date = new Date(iso);
  return !Number.isNaN(date.getTime()) && dayKey(date) === key;
}

/**
 * Everything on the dashboard is derived here, from the three stored
 * collections. Nothing is cached or incremented, so the numbers cannot fall
 * out of sync with the underlying records.
 *
 * A session counts toward the day it *ended*, so a session running across
 * midnight lands on the day the user finished it.
 */
export function computeDayStats(
  sessions: Session[],
  distractions: DistractionEvent[],
  tasks: Task[],
  now: Date = new Date(),
): DayStats {
  const key = dayKey(now);

  const todaysSessions = sessions.filter((s) =>
    isSameDay(s.endedAt ?? s.startedAt, key),
  );

  const focusedSeconds = todaysSessions.reduce(
    (total, s) => total + Math.max(0, s.focusedDuration),
    0,
  );

  const todaysDistractions = distractions.filter((d) => isSameDay(d.timestamp, key));

  const counts = new Map<string, number>();
  for (const event of todaysDistractions) {
    counts.set(event.reason, (counts.get(event.reason) ?? 0) + 1);
  }

  const breakdown = [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));

  return {
    focusedMinutes: Math.floor(focusedSeconds / 60),
    sessions: todaysSessions.length,
    // Each caught drift is one return.
    returns: todaysDistractions.length,
    tasksCompleted: tasks.filter((t) => t.completed).length,
    breakdown,
  };
}
