import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Goal } from "@/types/banking";

function GoalBar({ goal }: { goal: Goal }) {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { width: "0%" },
      { width: `${pct}%`, duration: 1.2, ease: "power3.out", delay: 0.15 }
    );
  }, [pct]);

  const monthsLeft = Math.max(
    0,
    Math.round(
      (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    )
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
            style={{ background: `${goal.color}22`, color: goal.color }}
          >
            {goal.glyph}
          </span>
          <span className="font-display text-sm text-bank-text">{goal.name}</span>
        </div>
        <span className="tabular text-xs text-bank-muted">
          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-bank-surface-2">
        <div
          ref={fillRef}
          className="h-full rounded-full"
          style={{ background: goal.color, width: "0%" }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-bank-muted">
        <span>{Math.round(pct)}% funded</span>
        <span>{monthsLeft > 0 ? `~${monthsLeft} mo left` : "Target date passed"}</span>
      </div>
    </div>
  );
}

export default function GoalsModule({ goals }: { goals: Goal[] }) {
  return (
    <div className="flex flex-col gap-5">
      {goals.map((g) => (
        <GoalBar key={g.id} goal={g} />
      ))}
    </div>
  );
}