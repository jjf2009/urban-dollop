"use client";

import { Check, Play, Trash2 } from "lucide-react";
import type { Task } from "@/lib/types";

export function TaskRow({
  task,
  onToggle,
  onDelete,
  onStart,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}) {
  return (
    <div className="group -mx-3 flex items-center gap-3 rounded-[3px] border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-pressed={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          task.completed
            ? "border-fg bg-fg text-bg"
            : "border-border-strong text-transparent hover:border-muted"
        }`}
      >
        <Check size={10} strokeWidth={3} />
      </button>

      <span
        className={`flex-1 truncate text-[15px] transition-colors ${
          task.completed ? "text-faint line-through decoration-faint" : "text-fg"
        }`}
      >
        {task.title}
      </span>

      <span className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {!task.completed && (
          <button
            type="button"
            onClick={() => onStart(task.id)}
            aria-label={`Start focus session for "${task.title}"`}
            className="flex size-7 items-center justify-center rounded-[3px] text-muted transition-colors hover:bg-[#181818] hover:text-fg"
          >
            <Play size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          className="flex size-7 items-center justify-center rounded-[3px] text-muted transition-colors hover:bg-[#1a1010] hover:text-danger"
        >
          <Trash2 size={13} />
        </button>
      </span>
    </div>
  );
}
