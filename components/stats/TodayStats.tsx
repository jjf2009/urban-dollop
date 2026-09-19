import { Stat } from "@/components/ui/Stat";
import type { DayStats } from "@/lib/stats";

export function TodayStats({ stats }: { stats: DayStats }) {
  return (
    <div className="grid grid-cols-2 border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border">
      <div className="border-b border-border sm:border-b-0">
        <Stat value={String(stats.focusedMinutes)} unit="min" label="Focused" />
      </div>
      <div className="border-b border-l border-border sm:border-b-0 sm:border-l-0">
        <Stat value={String(stats.sessions)} label="Sessions" />
      </div>
      <div>
        <Stat value={String(stats.returns)} label="Returns" />
      </div>
      <div className="border-l border-border sm:border-l-0">
        <Stat value={String(stats.tasksCompleted)} label="Completed" />
      </div>
    </div>
  );
}
