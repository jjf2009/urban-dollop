"use client";

import { useCallback, useSyncExternalStore } from "react";
import { KEYS, storage } from "@/lib/storage";
import { DEFAULT_DURATION, type DurationMinutes } from "@/lib/types";

let cached: DurationMinutes | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === KEYS.duration) {
      cached = null;
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDuration(): [DurationMinutes, (minutes: DurationMinutes) => void] {
  const duration = useSyncExternalStore(
    subscribe,
    () => (cached ??= storage.getDuration()),
    () => DEFAULT_DURATION,
  );

  const set = useCallback((minutes: DurationMinutes) => {
    storage.setDuration(minutes);
    cached = minutes;
    listeners.forEach((l) => l());
  }, []);

  return [duration, set];
}
