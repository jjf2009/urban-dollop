"use client";

import { DURATION_OPTIONS, type DurationMinutes } from "@/lib/types";

export function DurationPicker({
  value,
  onChange,
}: {
  value: DurationMinutes;
  onChange: (minutes: DurationMinutes) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Session length"
      className="inline-flex rounded-[3px] border border-border"
    >
      {DURATION_OPTIONS.map((minutes, index) => (
        <button
          key={minutes}
          type="button"
          role="radio"
          aria-checked={value === minutes}
          onClick={() => onChange(minutes)}
          className={`tabnum h-9 px-3.5 font-mono text-xs transition-colors ${
            index > 0 ? "border-l border-border" : ""
          } ${
            value === minutes
              ? "bg-surface text-fg"
              : "text-faint hover:bg-surface hover:text-muted"
          }`}
        >
          {minutes}
          <span className="ml-1 text-faint">m</span>
        </button>
      ))}
    </div>
  );
}
