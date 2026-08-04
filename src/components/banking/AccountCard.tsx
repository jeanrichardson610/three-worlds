import type { Account } from "@/types/banking";
import Sparkline from "./Sparkline";

const TYPE_LABEL: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  credit: "Credit",
};

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function AccountCard({
  account,
  hidden = false,
}: {
  account: Account;
  hidden?: boolean;
}) {
  const isNegative = account.balance < 0;
  const change = account.history[account.history.length - 1] - account.history[0];
  const changePct = (change / Math.abs(account.history[0] || 1)) * 100;

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-bank-border bg-bank-surface p-5 transition-colors hover:border-bank-mint/40">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-bank-muted">
          {TYPE_LABEL[account.type]}
        </span>
        <span className="text-xs text-bank-muted">{account.accountNumberMasked}</span>
      </div>
      <div>
        <p className="text-sm text-bank-muted">{account.name}</p>
        <p
          className={`tabular font-display text-2xl ${
            isNegative ? "text-bank-rose" : "text-bank-text"
          }`}
        >
          {hidden ? "••••••" : formatUSD(account.balance)}
        </p>
      </div>
      <div className="flex items-end justify-between">
        {hidden ? (
          <div className="h-8 w-[110px] rounded bg-bank-surface-2" />
        ) : (
          <Sparkline data={account.history} color="#33d6ac" width={110} height={32} />
        )}
        <span
          className={`tabular text-xs font-medium ${
            changePct >= 0 ? "text-bank-mint" : "text-bank-rose"
          }`}
        >
          {hidden ? "••" : `${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`}{" "}
          <span className="text-bank-muted">30d</span>
        </span>
      </div>
    </div>
  );
}