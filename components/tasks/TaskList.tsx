"use client";

import { AddTask } from "./AddTask";
import { TaskRow } from "./TaskRow";
import type { Task } from "@/lib/types";

export function TaskList({
  tasks,
  hydrated,
  onAdd,
  onToggle,
  onDelete,
  onStart,
}: {
  tasks: Task[];
  hydrated: boolean;
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}) {
  // Incomplete first, completed sink to the bottom; stable within each group.
  const ordered = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
  );

  return (
    <div className="flex flex-col">
      {!hydrated ? (
        <div className="py-2.5 text-[15px] text-faint">&nbsp;</div>
      ) : tasks.length === 0 ? (
        <p className="py-2.5 text-[15px] text-faint">
          Nothing yet. Name one thing you want to finish today.
        </p>
      ) : (
        ordered.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onStart={onStart}
          />
        ))
      )}
      <div className="mt-1">
        <AddTask onAdd={onAdd} />
      </div>
    </div>
  );
}
