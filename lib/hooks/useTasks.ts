"use client";

import { useCallback } from "react";
import { createId, storage } from "@/lib/storage";
import { useHydrated, useStoredTasks } from "@/lib/store";

export function useTasks() {
  const tasks = useStoredTasks();
  const hydrated = useHydrated();

  const addTask = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    storage.setTasks([
      ...storage.getTasks(),
      {
        id: createId(),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    storage.setTasks(
      storage.getTasks().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    storage.setTasks(storage.getTasks().filter((t) => t.id !== id));
  }, []);

  return { tasks, hydrated, addTask, toggleTask, deleteTask };
}
