"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";

export function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-[3px] border border-transparent px-3 py-2.5 text-left text-[15px] text-faint transition-colors hover:border-border hover:bg-surface hover:text-muted"
      >
        <Plus size={14} className="shrink-0" />
        Add task
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="-mx-3 flex items-center gap-3 rounded-[3px] border border-border-strong bg-surface px-3 py-2.5"
    >
      <Plus size={14} className="shrink-0 text-faint" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setValue("");
            setOpen(false);
          }
        }}
        placeholder="What are you working on?"
        aria-label="New task title"
        maxLength={140}
        className="flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-faint"
      />
      <kbd className="kbd hidden sm:block">Enter</kbd>
    </form>
  );
}
