export function Stat({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="group relative px-5 py-5 sm:py-6">
      <div className="flex items-baseline gap-1.5">
        <span className="tabnum font-mono text-4xl leading-none tracking-tight text-fg transition-colors">
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-xs text-faint">{unit}</span>
        ) : null}
      </div>
      <div className="label mt-3">{label}</div>
    </div>
  );
}
