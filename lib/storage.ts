import type { ActiveSession, DistractionEvent, Session, Task } from "./types";
import { DEFAULT_DURATION, DURATION_OPTIONS, type DurationMinutes } from "./types";

const PREFIX = "focusmode:";

export const KEYS = {
  tasks: `${PREFIX}tasks`,
  sessions: `${PREFIX}sessions`,
  distractions: `${PREFIX}distractions`,
  duration: `${PREFIX}duration`,
  active: `${PREFIX}active`,
} as const;

/**
 * Read + parse a key. Returns `fallback` for: SSR, missing key, malformed JSON,
 * or data that fails `isValid`. Corrupted entries are dropped so one bad write
 * can never brick the app.
 */
function read<T>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) {
      window.localStorage.removeItem(key);
      return fallback;
    }
    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable (private mode, quota) — fall through */
    }
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled storage — the in-memory state stays correct */
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function arrayOf<T>(check: (v: Record<string, unknown>) => boolean) {
  return (value: unknown): value is T[] =>
    Array.isArray(value) && value.every((item) => isObject(item) && check(item));
}

const isTaskArray = arrayOf<Task>(
  (t) =>
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "string",
);

const isSessionArray = arrayOf<Session>(
  (s) =>
    typeof s.id === "string" &&
    typeof s.taskId === "string" &&
    typeof s.startedAt === "string" &&
    typeof s.plannedDuration === "number" &&
    typeof s.focusedDuration === "number" &&
    typeof s.completed === "boolean",
);

const isDistractionArray = arrayOf<DistractionEvent>(
  (d) =>
    typeof d.id === "string" &&
    typeof d.sessionId === "string" &&
    typeof d.reason === "string" &&
    typeof d.timestamp === "string",
);

const isActiveSession = (value: unknown): value is ActiveSession =>
  isObject(value) &&
  typeof value.id === "string" &&
  typeof value.taskId === "string" &&
  typeof value.startedAt === "string" &&
  typeof value.plannedDuration === "number" &&
  typeof value.accumulatedSeconds === "number" &&
  (value.runningSince === null || typeof value.runningSince === "string");

const isActiveOrNull = (value: unknown): value is ActiveSession | null =>
  value === null || isActiveSession(value);

export const storage = {
  getTasks: () => read<Task[]>(KEYS.tasks, isTaskArray, []),
  setTasks: (tasks: Task[]) => write(KEYS.tasks, tasks),

  getSessions: () => read<Session[]>(KEYS.sessions, isSessionArray, []),
  setSessions: (sessions: Session[]) => write(KEYS.sessions, sessions),

  getDistractions: () => read<DistractionEvent[]>(KEYS.distractions, isDistractionArray, []),
  setDistractions: (events: DistractionEvent[]) => write(KEYS.distractions, events),

  getDuration: (): DurationMinutes =>
    read<DurationMinutes>(
      KEYS.duration,
      (v): v is DurationMinutes =>
        typeof v === "number" && (DURATION_OPTIONS as readonly number[]).includes(v),
      DEFAULT_DURATION,
    ),
  setDuration: (minutes: DurationMinutes) => write(KEYS.duration, minutes),

  getActive: () => read<ActiveSession | null>(KEYS.active, isActiveOrNull, null),
  setActive: (session: ActiveSession | null) => write(KEYS.active, session),
};

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
