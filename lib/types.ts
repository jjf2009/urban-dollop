export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export type Session = {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string;
  /** seconds */
  plannedDuration: number;
  /** seconds actually focused (excludes paused/drifting time) */
  focusedDuration: number;
  completed: boolean;
};

/**
 * The one session currently in progress. Persisted so a refresh, a closed tab,
 * or a backgrounded browser never loses or distorts elapsed time.
 *
 * Elapsed focus = `accumulatedSeconds` + (now - runningSince) when running.
 * `runningSince === null` means paused. Time never advances while paused.
 */
export type ActiveSession = {
  id: string;
  taskId: string;
  startedAt: string;
  /** seconds */
  plannedDuration: number;
  /** seconds banked from previous run segments */
  accumulatedSeconds: number;
  /** ISO timestamp the current run segment began, or null when paused */
  runningSince: string | null;
};

export type DistractionEvent = {
  id: string;
  sessionId: string;
  reason: string;
  timestamp: string;
};

export const DURATION_OPTIONS = [25, 45, 60] as const;
export type DurationMinutes = (typeof DURATION_OPTIONS)[number];
export const DEFAULT_DURATION: DurationMinutes = 45;

export const DISTRACTION_REASONS = [
  "YouTube",
  "X / social media",
  "Phone",
  "Daydreaming",
  "Another project",
  "Porn / urge",
  "Other",
] as const;
