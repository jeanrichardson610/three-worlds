import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Budget } from "@/types/banking";

function Ring({ budget }: { budget: Budget }) {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const pct = Math.min(budget.spent / budget.limit, 1.15);
  const overBudget = budget.spent > budget.limit;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    gsap.set(el, { strokeDasharray: circumference, strokeDashoffset: circumference });
    gsap.to(el, {
      strokeDashoffset: circumference * (1 - Math.min(pct, 1)),
      duration: 1.2,
      ease: "power3.out",
      delay: 0.1,
    });
  }, [pct, circumference]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--color-bank-surface-2)"
            strokeWidth="7"
          />
          <circle
            ref={circleRef}
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={overBudget ? "#ff6b7a" : budget.color}
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
        <span
          className={`absolute font-display text-sm ${
            overBudget ? "text-bank-rose" : "text-bank-text"
          }`}
        >
          {Math.round((budget.spent / budget.limit) * 100)}%
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs capitalize text-bank-text">{budget.category}</p>
        <p className="tabular text-[11px] text-bank-muted">
          ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
        </p>
      </div>
    </div>
  );
}

export default function BudgetRings({ budgets }: { budgets: Budget[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {budgets.map((b) => (
        <Ring key={b.category} budget={b} />
      ))}
    </div>
  );
}