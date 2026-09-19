"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { KEYS, createId, storage } from "@/lib/storage";
import { mutate, useStoredSessions } from "@/lib/store";
import { finalize, isRunning, pause, remainingSeconds, resume } from "@/lib/sessions";
import type { ActiveSession, DurationMinutes } from "@/lib/types";

function useStoredActive(): ActiveSession | null {
  return useSyncExternalStore(
    subscribeActive,
    () => activeSnapshot(),
    () => null,
  );
}

let cached: { value: ActiveSession | null } | null = null;
const activeListeners = new Set<() => void>();

function activeSnapshot(): ActiveSession | null {
  if (cached === null) cached = { value: storage.getActive() };
  return cached.value;
}

function subscribeActive(listener: () => void) {
  activeListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === KEYS.active) {
      cached = null;
      activeListeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    activeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeActive(next: ActiveSession | null) {
  storage.setActive(next);
  cached = { value: next };
  activeListeners.forEach((l) => l());
}

export function useActiveSession() {
  const active = useStoredActive();
  const sessions = useStoredSessions();

  const start = useCallback((taskId: string, minutes: DurationMinutes) => {
    const now = new Date().toISOString();
    writeActive({
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
    if (current) writeActive(pause(current));
  }, []);

  const resumeSession = useCallback(() => {
    const current = storage.getActive();
    if (current) writeActive(resume(current));
  }, []);

  const toggle = useCallback(() => {
    const current = storage.getActive();
    if (!current) return;
    writeActive(isRunning(current) ? pause(current) : resume(current));
  }, []);

  /** Write the session to history and clear the active slot. Returns the record. */
  const finish = useCallback(() => {
    const current = storage.getActive();
    if (!current) return null;
    const record = finalize(current);
    mutate(KEYS.sessions, storage.setSessions, [...storage.getSessions(), record]);
    writeActive(null);
    return record;
  }, []);

  const discard = useCallback(() => writeActive(null), []);

  return { active, sessions, start, pause: pauseSession, resume: resumeSession, toggle, finish, discard };
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

    // Read from storage rather than closing over props — the tick always sees
    // the newest session, including one paused or resumed in another tab.
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
