"use client";

import { EMPTY_STATE, normalizeState, type AppState } from "./state";
import type { ActiveSession, DistractionEvent, DurationMinutes, Session, Task } from "./types";

/**
 * The persisted store lives in `data/focusmode.json`, behind `/api/state`.
 *
 * Reads stay synchronous for callers: the file is loaded once into this
 * module-level snapshot, and every mutation updates the snapshot immediately
 * and flushes to disk in the background. The UI therefore never waits on I/O,
 * and a failed write leaves the in-memory state correct with `saveError` set.
 */
let state: AppState = EMPTY_STATE;
let loaded = false;
let saveError = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureLoaded();
  return () => listeners.delete(listener);
}

export const getState = (): AppState => state;
export const isLoaded = (): boolean => loaded;
export const hasSaveError = (): boolean => saveError;

// ---------------------------------------------------------------- loading

let loading: Promise<void> | null = null;

/** Fetch the file once. Safe to call repeatedly. */
export function ensureLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  loading ??= fetch("/api/state", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : EMPTY_STATE))
    .catch(() => EMPTY_STATE)
    .then((value: unknown) => {
      state = normalizeState(value);
      loaded = true;
      emit();
    });
  return loading;
}

/** Re-read from disk, discarding the in-memory snapshot. */
export async function reload(): Promise<void> {
  loading = null;
  await ensureLoaded();
}

// ---------------------------------------------------------------- saving

let flushTimer: number | null = null;
let inFlight: Promise<void> = Promise.resolve();

/**
 * Coalesce rapid mutations into one request. Every write sends the whole
 * document, so the last flush always wins and no partial update can be lost.
 */
function scheduleFlush() {
  if (typeof window === "undefined") return;
  if (flushTimer !== null) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(flush, 120);
}

function flush() {
  flushTimer = null;
  const payload = JSON.stringify(state);
  inFlight = inFlight
    .then(() =>
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }),
    )
    .then((response) => {
      const failed = !response.ok;
      if (failed !== saveError) {
        saveError = failed;
        emit();
      }
    })
    .catch(() => {
      if (!saveError) {
        saveError = true;
        emit();
      }
    });
}

function update(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  emit();
  scheduleFlush();
}

if (typeof window !== "undefined") {
  // Don't lose the last few hundred milliseconds of work on a tab close.
  window.addEventListener("pagehide", () => {
    if (flushTimer !== null) {
      window.clearTimeout(flushTimer);
      flush();
    }
  });
  ensureLoaded();
}

// ---------------------------------------------------------------- accessors

export const storage = {
  getTasks: (): Task[] => state.tasks,
  setTasks: (tasks: Task[]) => update({ tasks }),

  getSessions: (): Session[] => state.sessions,
  setSessions: (sessions: Session[]) => update({ sessions }),

  getDistractions: (): DistractionEvent[] => state.distractions,
  setDistractions: (distractions: DistractionEvent[]) => update({ distractions }),

  getDuration: (): DurationMinutes => state.duration,
  setDuration: (duration: DurationMinutes) => update({ duration }),

  getActive: (): ActiveSession | null => state.active,
  setActive: (active: ActiveSession | null) => update({ active }),
};

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
