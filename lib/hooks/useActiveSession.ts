"use client";

import { useCallback, useEffect, useState } from "react";
import { createId, storage } from "@/lib/storage";
import { useStoredActive, useStoredSessions } from "@/lib/store";
import { finalize, isRunning, pause, remainingSeconds, resume } from "@/lib/sessions";
import type { ActiveSession, DurationMinutes } from "@/lib/types";

export function useActiveSession() {
  const active = useStoredActive();
  const sessions = useStoredSessions();

  const start = useCallback((taskId: string, minutes: DurationMinutes) => {
    const now = new Date().toISOString();
    storage.setActive({
      id: createId(),
      taskId,
      startedAt: now,
      plannedDuration: minutes * 60,
      accumulatedSeconds: 0,
      runningSince: now,
    });
  }, []);

  const pauseSession = useCallback(() => {
    const current = storage.getActive();
    if (current) storage.setActive(pause(current));
  }, []);

  const resumeSession = useCallback(() => {
    const current = storage.getActive();
    if (current) storage.setActive(resume(current));
  }, []);

  const toggle = useCallback(() => {
    const current = storage.getActive();
    if (!current) return;
    storage.setActive(isRunning(current) ? pause(current) : resume(current));
  }, []);

  /** Write the session to history and clear the active slot. Returns the record. */
  const finish = useCallback(() => {
    const current = storage.getActive();
    if (!current) return null;
    const record = finalize(current);
    storage.setSessions([...storage.getSessions(), record]);
    storage.setActive(null);
    return record;
  }, []);

  const discard = useCallback(() => storage.setActive(null), []);

  return {
    active,
    sessions,
    start,
    pause: pauseSession,
    resume: resumeSession,
    toggle,
    finish,
    discard,
  };
}

/**
 * Re-renders roughly once a second while running, recomputing from wall-clock
 * time each tick. A missed or delayed tick costs display smoothness, never
 * accuracy. `onExpire` fires once, from the tick itself, when the clock hits
 * zero — including after the tab was backgrounded past the end time.
 */
export function useCountdown(
  active: ActiveSession | null,
  onExpire?: () => void,
): number {
  const [, force] = useState(0);
  const running = active !== null && isRunning(active);

  useEffect(() => {
    if (!running) return;
    let expired = false;

    const tick = () => {
      const current = storage.getActive();
      if (current && remainingSeconds(current) <= 0) {
        if (expired) return;
        expired = true;
        onExpire?.();
        return;
      }
      force((n) => n + 1);
    };

    const id = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running, onExpire]);

  return active === null ? 0 : remainingSeconds(active);
}
