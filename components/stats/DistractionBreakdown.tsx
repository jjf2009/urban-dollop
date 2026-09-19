export function DistractionBreakdown({
  breakdown,
}: {
  breakdown: { reason: string; count: number }[];
}) {
  if (breakdown.length === 0) {
    return <p className="text-sm text-faint">No drifts recorded today.</p>;
  }

  const max = breakdown[0].count;

  return (
    <ul className="flex flex-col">
      {breakdown.map(({ reason, count }) => (
        <li key={reason} className="group py-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className="truncate text-sm text-muted transition-colors group-hover:text-fg">
              {reason}
            </span>
            <span className="tabnum shrink-0 font-mono text-sm text-fg">{count}</span>
          </div>
          <div className="mt-1.5 h-px w-full bg-border">
            <div
              className="h-px bg-border-strong transition-colors group-hover:bg-muted"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
