"use client";

import { useSyncExternalStore } from "react";
import { KEYS, storage } from "./storage";
import type { DistractionEvent, Session, Task } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Snapshots must be referentially stable between notifications, otherwise
 * useSyncExternalStore loops forever. We cache the last parsed value per key
 * and only re-read when something invalidates it.
 */
const cache = new Map<string, unknown>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Another tab wrote to localStorage — drop our cache and re-render.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith("focusmode:")) {
      cache.clear();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function snapshot<T>(key: string, load: () => T): T {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as T;
}

const EMPTY: never[] = [];

function useStored<T>(key: string, load: () => T, serverValue: T): T {
  return useSyncExternalStore(
    subscribe,
    () => snapshot(key, load),
    () => serverValue,
  );
}

export const useStoredTasks = () =>
  useStored<Task[]>(KEYS.tasks, storage.getTasks, EMPTY);
export const useStoredSessions = () =>
  useStored<Session[]>(KEYS.sessions, storage.getSessions, EMPTY);
export const useStoredDistractions = () =>
  useStored<DistractionEvent[]>(KEYS.distractions, storage.getDistractions, EMPTY);

/** Every mutation goes through here so the cache and subscribers stay in sync. */
export function mutate<T>(key: string, persist: (value: T) => void, next: T): void {
  persist(next);
  cache.set(key, next);
  emit();
}

/** True once the component has mounted on the client. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
