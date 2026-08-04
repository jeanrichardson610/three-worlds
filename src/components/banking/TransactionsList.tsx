import { useMemo, useState } from "react";
import type { Transaction, TransactionCategory } from "@/types/banking";
import { CATEGORY_COLOR } from "@/data/bankingData";
import { useGsapReveal } from "@/hooks/useGsapReveal";

export const CATEGORY_GLYPH: Record<TransactionCategory, string> = {
  groceries: "🛒",
  dining: "🍜",
  transport: "🚕",
  shopping: "🛍",
  income: "💼",
  utilities: "💡",
  entertainment: "🎬",
  transfer: "↔",
  health: "➕",
  subscriptions: "🔁",
};

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

function formatUSD(n: number) {
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TransactionsList({
  transactions,
  categoryFilter,
  onCategoryFilterChange,
  onSelectTransaction,
}: {
  transactions: Transaction[];
  categoryFilter: TransactionCategory | null;
  onCategoryFilterChange: (category: TransactionCategory | null) => void;
  onSelectTransaction?: (transaction: Transaction, originRect: DOMRect) => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date-desc");

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions]
  );

  const filtered = useMemo(() => {
    let list = transactions;
    if (categoryFilter) {
      list = list.filter((t) => t.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.merchant.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount);
        case "date-desc":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
    return sorted;
  }, [transactions, categoryFilter, search, sort]);

  const listRef = useGsapReveal<HTMLDivElement>([filtered.length, search, categoryFilter, sort], {
    y: 8,
    stagger: 0.03,
    duration: 0.35,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search merchant or category…"
          className="w-full rounded-lg border border-bank-border bg-transparent px-3 py-2 text-sm text-bank-text outline-none focus:border-bank-mint sm:max-w-xs"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-bank-border bg-transparent px-3 py-2 text-xs text-bank-muted outline-none focus:border-bank-mint"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Largest amount</option>
          <option value="amount-asc">Smallest amount</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => onCategoryFilterChange(categoryFilter === c ? null : c)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              categoryFilter === c
                ? ""
                : "border-bank-border text-bank-muted hover:text-bank-text"
            }`}
            style={
              categoryFilter === c
                ? {
                    borderColor: CATEGORY_COLOR[c] ?? "#33d6ac",
                    color: CATEGORY_COLOR[c] ?? "#33d6ac",
                    background: `${CATEGORY_COLOR[c] ?? "#33d6ac"}18`,
                  }
                : undefined
            }
          >
            <span>{CATEGORY_GLYPH[c]}</span>
            {c}
          </button>
        ))}
        {categoryFilter && (
          <button
            onClick={() => onCategoryFilterChange(null)}
            className="rounded-full border border-bank-border px-3 py-1 text-xs text-bank-muted hover:text-bank-text"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      <div ref={listRef} className="flex max-h-[420px] flex-col divide-y divide-bank-border overflow-y-auto">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-bank-muted">
            No transactions match your search.
          </p>
        )}
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={(e) => onSelectTransaction?.(t, e.currentTarget.getBoundingClientRect())}
            className="flex items-center gap-3 py-3 text-left transition-colors hover:bg-bank-surface-2/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bank-surface-2 text-base">
              {CATEGORY_GLYPH[t.category]}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm text-bank-text">
                {t.merchant}
                {t.status === "pending" && (
                  <span className="ml-2 rounded-full bg-bank-gold/15 px-1.5 py-0.5 text-[10px] text-bank-gold">
                    Pending
                  </span>
                )}
              </span>
              <span className="text-xs text-bank-muted">
                {formatDate(t.date)} · {t.status === "pending" ? "Pending" : "Posted"}
              </span>
            </div>
            <span
              className={`tabular shrink-0 text-sm font-medium ${
                t.amount < 0 ? "text-bank-text" : "text-bank-mint"
              }`}
            >
              {formatUSD(t.amount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}