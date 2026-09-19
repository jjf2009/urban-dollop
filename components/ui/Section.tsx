import type { ReactNode } from "react";

export function Section({
  label,
  action,
  children,
  className = "",
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-14 ${className}`}>
      <div className="mb-5 flex items-center gap-4">
        <h2 className="label shrink-0">{label}</h2>
        <div className="h-px flex-1 bg-border" />
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
