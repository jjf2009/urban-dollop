import { formatClock } from "@/lib/sessions";

export function TimerDisplay({
  remaining,
  total,
  running,
}: {
  remaining: number;
  total: number;
  running: boolean;
}) {
  const progress = total > 0 ? 1 - remaining / total : 0;

  return (
    <div className="w-full">
      <div
        className={`tabnum text-center font-mono text-[clamp(4rem,18vw,8rem)] font-light leading-none tracking-tight transition-colors duration-300 ${
          running ? "text-fg" : "text-faint"
        }`}
        role="timer"
        aria-live="off"
      >
        {formatClock(remaining)}
      </div>

      <div className="mt-10 h-px w-full bg-border">
        <div
          className="h-px bg-fg transition-[width] duration-500 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
