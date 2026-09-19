"use client";

import { useMemo } from "react";
import { computeDayStats, type DayStats } from "@/lib/stats";
import { useStoredDistractions, useStoredSessions, useStoredTasks } from "@/lib/store";

export function useDayStats(): DayStats {
  const sessions = useStoredSessions();
  const distractions = useStoredDistractions();
  const tasks = useStoredTasks();

  return useMemo(
    () => computeDayStats(sessions, distractions, tasks),
    [sessions, distractions, tasks],
  );
}
