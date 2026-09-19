"use client";

import { useCallback } from "react";
import { KEYS, createId, storage } from "@/lib/storage";
import { mutate, useStoredDistractions } from "@/lib/store";
import type { DistractionEvent } from "@/lib/types";

export function useDistractions() {
  const distractions = useStoredDistractions();

  const record = useCallback((sessionId: string, reason: string) => {
    const event: DistractionEvent = {
      id: createId(),
      sessionId,
      reason,
      timestamp: new Date().toISOString(),
    };
    mutate(KEYS.distractions, storage.setDistractions, [
      ...storage.getDistractions(),
      event,
    ]);
    return event;
  }, []);

  return { distractions, record };
}

/** Every caught drift is one return, so the two counts are the same number. */
export function countForSession(
  distractions: DistractionEvent[],
  sessionId: string | undefined,
): number {
  if (!sessionId) return 0;
  return distractions.filter((d) => d.sessionId === sessionId).length;
}
