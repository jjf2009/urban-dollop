"use client";

import { Button } from "@/components/ui/Button";
import type { Session } from "@/lib/types";

export function SessionComplete({
  session,
  taskTitle,
  distractions,
  onDone,
}: {
  session: Session;
  taskTitle: string;
  distractions: number;
  onDone: () => void;
}) {
  const minutes = Math.round(session.focusedDuration / 60);

  return (
    <div className="rise flex min-h-dvh flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="label">
          {session.completed ? "Session complete" : "Session ended"}
        </p>

        <h1 className="mt-6 text-2xl leading-snug text-fg">{taskTitle}</h1>

        <dl className="mt-10 divide-y divide-border border-y border-border">
          <div className="flex items-baseline justify-between py-3.5">
            <dt className="text-sm text-muted">Focused</dt>
            <dd className="tabnum font-mono text-sm text-fg">{minutes} min</dd>
          </div>
          <div className="flex items-baseline justify-between py-3.5">
            <dt className="text-sm text-muted">Distractions</dt>
            <dd className="tabnum font-mono text-sm text-fg">{distractions}</dd>
          </div>
          <div className="flex items-baseline justify-between py-3.5">
            <dt className="text-sm text-muted">Returns</dt>
            <dd className="tabnum font-mono text-sm text-fg">{distractions}</dd>
          </div>
        </dl>

        <Button variant="primary" size="lg" className="mt-10 w-full" onClick={onDone} autoFocus>
          Done
        </Button>
      </div>
    </div>
  );
}
