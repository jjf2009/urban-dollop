"use client";

import { useSyncExternalStore } from "react";
import { getState, isLoaded, hasSaveError, subscribe } from "./storage";
import type { ActiveSession, DistractionEvent, Session, Task } from "./types";
import { EMPTY_STATE } from "./state";

/**
 * Snapshots are slices of one module-level object that is replaced wholesale on
 * every mutation, so they stay referentially stable between notifications —
 * which is what useSyncExternalStore requires.
 */
function useSlice<T>(select: (state: typeof EMPTY_STATE) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getState()),
    () => select(EMPTY_STATE),
  );
}

export const useStoredTasks = (): Task[] => useSlice((s) => s.tasks);
export const useStoredSessions = (): Session[] => useSlice((s) => s.sessions);
export const useStoredDistractions = (): DistractionEvent[] =>
  useSlice((s) => s.distractions);
export const useStoredActive = (): ActiveSession | null => useSlice((s) => s.active);

/** False until the JSON file has been read, so "empty" isn't shown prematurely. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, isLoaded, () => false);
}

/** True when the last write to disk failed. */
export function useSaveError(): boolean {
  return useSyncExternalStore(subscribe, hasSaveError, () => false);
}

export const useSlicedDuration = () => useSlice((s) => s.duration);
