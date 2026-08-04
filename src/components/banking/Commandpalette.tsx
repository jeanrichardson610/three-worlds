import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { Account } from "@/types/banking";
import type { BankingTab } from "./BankingTabs";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  glyph: string;
  action: () => void;
}

export default function CommandPalette({
  accounts,
  onFreezeAll,
  onNavigate,
  onExportStatement,
  onToggleBalances,
}: {
  accounts: Account[];
  onFreezeAll: () => void;
  onNavigate: (tab: BankingTab, sectionId?: string) => void;
  onExportStatement: () => void;
  onToggleBalances: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo<CommandItem[]>(() => {
    const accountItems: CommandItem[] = accounts.map((a) => ({
      id: `acc-${a.id}`,
      label: a.name,
      hint: `Account · ${a.accountNumberMasked}`,
      glyph: "◆",
      action: () => onNavigate("overview", "section-accounts"),
    }));

    const actionItems: CommandItem[] = [
      {
        id: "action-overview",
        label: "Go to Overview",
        hint: "Tab",
        glyph: "⌂",
        action: () => onNavigate("overview"),
      },
      {
        id: "action-transactions-tab",
        label: "Go to Transactions",
        hint: "Tab",
        glyph: "🧾",
        action: () => onNavigate("transactions"),
      },
      {
        id: "action-cards-tab",
        label: "Go to Cards",
        hint: "Tab",
        glyph: "▭",
        action: () => onNavigate("cards"),
      },
      {
        id: "action-goals-tab",
        label: "Go to Goals",
        hint: "Tab",
        glyph: "◈",
        action: () => onNavigate("goals"),
      },
      {
        id: "action-freeze-all",
        label: "Freeze all cards",
        hint: "Action",
        glyph: "❄",
        action: () => {
          onNavigate("cards");
          window.setTimeout(() => onFreezeAll(), 80);
        },
      },
      {
        id: "action-toggle-balances",
        label: "Hide/show balances",
        hint: "Action",
        glyph: "◉",
        action: onToggleBalances,
      },
      {
        id: "action-export",
        label: "Export statement (PDF)",
        hint: "Action",
        glyph: "⬇",
        action: onExportStatement,
      },
      {
        id: "action-net-worth",
        label: "View net worth trend",
        hint: "Jump to section",
        glyph: "📈",
        action: () => onNavigate("overview", "section-networth"),
      },
      {
        id: "action-budgets",
        label: "View budgets",
        hint: "Jump to section",
        glyph: "◎",
        action: () => onNavigate("overview", "section-budgets"),
      },
      {
        id: "action-money-flow",
        label: "View money flow",
        hint: "Jump to section",
        glyph: "🌊",
        action: () => onNavigate("overview", "section-moneyflow"),
      },
    ];

    return [...actionItems, ...accountItems];
  }, [accounts, onFreezeAll, onNavigate, onExportStatement, onToggleBalances]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" }
      );
    });
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      ctx.revert();
      clearTimeout(t);
    };
  }, [open]);

  const runItem = (item: CommandItem) => {
    item.action();
    setOpen(false);
    setQuery("");
  };

  const handleInputKeydown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Enter" && filtered[highlight]) {
      runItem(filtered[highlight]);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-bank-border px-3 py-2 text-xs text-bank-muted transition-colors hover:text-bank-text"
      >
        <span>Search…</span>
        <kbd className="rounded border border-bank-border bg-bank-surface-2 px-1.5 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>

      {open &&
        createPortal(
          <div
            ref={overlayRef}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
          >
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-bank-border bg-bank-surface shadow-2xl"
            >
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeydown}
                placeholder="Jump to a tab, account, or action…"
                className="w-full border-b border-bank-border bg-transparent px-4 py-3.5 text-sm text-bank-text outline-none"
              />
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-bank-muted">
                    No matches.
                  </p>
                )}
                {filtered.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => runItem(item)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      i === highlight ? "bg-bank-mint/15" : ""
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bank-surface-2 text-sm text-bank-text">
                      {item.glyph}
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-sm text-bank-text">{item.label}</span>
                      <span className="text-[11px] text-bank-muted">{item.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}