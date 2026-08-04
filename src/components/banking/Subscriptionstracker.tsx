import { useGsapReveal } from "@/hooks/useGsapReveal";
import type { Subscription } from "@/types/banking";

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export default function SubscriptionsTracker({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const sorted = [...subscriptions].sort(
    (a, b) => new Date(a.nextChargeDate).getTime() - new Date(b.nextChargeDate).getTime()
  );

  const monthlyTotal = subscriptions.reduce(
    (sum, s) => sum + (s.cadence === "monthly" ? s.amount : s.amount / 12),
    0
  );
  const dueThisWeek = subscriptions.filter((s) => daysUntil(s.nextChargeDate) <= 7);
  const dueThisWeekTotal = dueThisWeek.reduce((sum, s) => sum + s.amount, 0);

  const listRef = useGsapReveal<HTMLDivElement>([subscriptions.length], { y: 10, stagger: 0.05 });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-bank-surface-2 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-bank-muted">
            Renewing this week
          </p>
          <p className="tabular font-display text-lg text-bank-text">
            ${dueThisWeekTotal.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-bank-muted">
            Est. monthly total
          </p>
          <p className="tabular text-sm text-bank-mint">${monthlyTotal.toFixed(2)}/mo</p>
        </div>
      </div>

      <div ref={listRef} className="flex flex-col divide-y divide-bank-border">
        {sorted.map((s) => {
          const days = daysUntil(s.nextChargeDate);
          const soon = days <= 7;
          return (
            <div key={s.id} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bank-surface-2 font-display text-sm text-bank-text">
                {s.glyph}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-bank-text">{s.name}</span>
                <span className={`text-xs ${soon ? "text-bank-gold" : "text-bank-muted"}`}>
                  {days <= 0 ? "Renews today" : `Renews in ${days}d`} ·{" "}
                  {s.cadence === "monthly" ? "Monthly" : "Yearly"}
                </span>
              </div>
              <span className="tabular shrink-0 text-sm font-medium text-bank-text">
                ${s.amount.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}