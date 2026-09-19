"use client";

import { useCallback } from "react";
import { mutate, useHydrated, useStoredTasks } from "@/lib/store";
import { KEYS, createId, storage } from "@/lib/storage";
import type { Task } from "@/lib/types";

export function useTasks() {
  const tasks = useStoredTasks();
  const hydrated = useHydrated();

  const commit = useCallback((next: Task[]) => {
    mutate(KEYS.tasks, storage.setTasks, next);
  }, []);

  const addTask = useCallback(
    (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      commit([
        ...storage.getTasks(),
        {
          id: createId(),
          title: trimmed,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    [commit],
  );

  const toggleTask = useCallback(
    (id: string) => {
      commit(
        storage.getTasks().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    },
    [commit],
  );

  const deleteTask = useCallback(
    (id: string) => {
      commit(storage.getTasks().filter((t) => t.id !== id));
    },
    [commit],
  );

  return { tasks, hydrated, addTask, toggleTask, deleteTask };
}
