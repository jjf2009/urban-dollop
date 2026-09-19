import type {
  ActiveSession,
  DistractionEvent,
  DurationMinutes,
  Session,
  Task,
} from "./types";
import { DEFAULT_DURATION, DURATION_OPTIONS } from "./types";

/** The entire app, as persisted to `data/focusmode.json`. */
export type AppState = {
  tasks: Task[];
  sessions: Session[];
  distractions: DistractionEvent[];
  duration: DurationMinutes;
  active: ActiveSession | null;
};

export const EMPTY_STATE: AppState = {
  tasks: [],
  sessions: [],
  distractions: [],
  duration: DEFAULT_DURATION,
  active: null,
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function arrayOf<T>(check: (v: Record<string, unknown>) => boolean) {
  return (value: unknown): T[] =>
    Array.isArray(value)
      ? (value.filter((item) => isObject(item) && check(item)) as T[])
      : [];
}

const tasksFrom = arrayOf<Task>(
  (t) =>
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "string",
);

const sessionsFrom = arrayOf<Session>(
  (s) =>
    typeof s.id === "string" &&
    typeof s.taskId === "string" &&
    typeof s.startedAt === "string" &&
    typeof s.plannedDuration === "number" &&
    typeof s.focusedDuration === "number" &&
    typeof s.completed === "boolean",
);

const distractionsFrom = arrayOf<DistractionEvent>(
  (d) =>
    typeof d.id === "string" &&
    typeof d.sessionId === "string" &&
    typeof d.reason === "string" &&
    typeof d.timestamp === "string",
);

function activeFrom(value: unknown): ActiveSession | null {
  if (!isObject(value)) return null;
  const ok =
    typeof value.id === "string" &&
    typeof value.taskId === "string" &&
    typeof value.startedAt === "string" &&
    typeof value.plannedDuration === "number" &&
    typeof value.accumulatedSeconds === "number" &&
    (value.runningSince === null || typeof value.runningSince === "string");
  return ok ? (value as ActiveSession) : null;
}

function durationFrom(value: unknown): DurationMinutes {
  return typeof value === "number" &&
    (DURATION_OPTIONS as readonly number[]).includes(value)
    ? (value as DurationMinutes)
    : DEFAULT_DURATION;
}

/**
 * Coerce anything into a usable AppState. Unrecognised records are dropped
 * rather than thrown on, so a hand-edited or partly corrupted JSON file costs
 * the user the bad rows, never the whole app.
 */
export function normalizeState(value: unknown): AppState {
  if (!isObject(value)) return EMPTY_STATE;
  return {
    tasks: tasksFrom(value.tasks),
    sessions: sessionsFrom(value.sessions),
    distractions: distractionsFrom(value.distractions),
    duration: durationFrom(value.duration),
    active: activeFrom(value.active),
  };
}
