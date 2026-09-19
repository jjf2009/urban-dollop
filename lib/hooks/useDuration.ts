"use client";

import { useCallback } from "react";
import { storage } from "@/lib/storage";
import { useSlicedDuration } from "@/lib/store";
import type { DurationMinutes } from "@/lib/types";

export function useDuration(): [DurationMinutes, (minutes: DurationMinutes) => void] {
  const duration = useSlicedDuration();
  const set = useCallback((minutes: DurationMinutes) => storage.setDuration(minutes), []);
  return [duration, set];
}
