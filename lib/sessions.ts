import type { ActiveSession, Session } from "./types";

/**
 * Seconds of focus banked so far. Derived from wall-clock timestamps rather
 * than counted by an interval, so background-tab throttling, sleep, and
 * dropped frames cannot make the timer drift.
 */
export function elapsedSeconds(active: ActiveSession, now: number = Date.now()): number {
  const running =
    active.runningSince === null
      ? 0
      : Math.max(0, (now - new Date(active.runningSince).getTime()) / 1000);
  return active.accumulatedSeconds + running;
}

/** Seconds left on the clock, floored at zero. */
export function remainingSeconds(active: ActiveSession, now: number = Date.now()): number {
  return Math.max(0, active.plannedDuration - elapsedSeconds(active, now));
}

export function isRunning(active: ActiveSession): boolean {
  return active.runningSince !== null;
}

export function pause(active: ActiveSession, now: number = Date.now()): ActiveSession {
  if (active.runningSince === null) return active;
  return {
    ...active,
    accumulatedSeconds: elapsedSeconds(active, now),
    runningSince: null,
  };
}

export function resume(active: ActiveSession, now: number = Date.now()): ActiveSession {
  if (active.runningSince !== null) return active;
  return { ...active, runningSince: new Date(now).toISOString() };
}

/**
 * Freeze the active session into a permanent record. `completed` is true when
 * the planned duration was actually reached, false when the user stopped early.
 */
export function finalize(active: ActiveSession, now: number = Date.now()): Session {
  const focused = Math.min(elapsedSeconds(active, now), active.plannedDuration);
  return {
    id: active.id,
    taskId: active.taskId,
    startedAt: active.startedAt,
    endedAt: new Date(now).toISOString(),
    plannedDuration: active.plannedDuration,
    focusedDuration: Math.round(focused),
    completed: focused >= active.plannedDuration,
  };
}

/** mm:ss, or h:mm:ss past an hour. */
export function formatClock(totalSeconds: number): string {
  const whole = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
