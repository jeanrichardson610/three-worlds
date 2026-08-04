import { useMemo, useRef, useState } from "react";
import {
  accounts,
  budgets,
  buildInsights,
  buildMoneyFlow,
  CATEGORY_COLOR,
  cards,
  categoryBreakdown,
  contacts,
  goals,
  netWorthHistory,
  spendingHistory,
  subscriptions,
  transactions,
} from "@/data/bankingData";
import type { Transaction, TransactionCategory } from "@/types/banking";
import { useCountUp } from "@/hooks/useCountUp";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { useLiveActivity } from "@/hooks/useLiveActivity";
import { generateStatementPdf } from "@/lib/Statementpdf";
import AccountCard from "./AccountCard";
import SpendingChart from "./SpendingChart";
import NetWorthChart from "./Networthchart";
import MoneyFlowSankey from "./MoneyFlowSankey";
import TransactionsList from "./TransactionsList";
import CardsPanel, { type CardsPanelHandle } from "./CardsPanel";
import QuickTransfer from "./QuickTransfer";
import BudgetRings from "./BudgetRings";
import SubscriptionsTracker from "./Subscriptionstracker";
import InsightsCarousel from "./Insightscarousel";
import CommandPalette from "./Commandpalette";
import BankingTabs, { type BankingTab } from "./BankingTabs";
import LiveTicker from "./LiveTicker";
import TransactionDetail from "./TransactionDetail";
import GoalsModule from "./GoalsModule";

const CHECKING_ID = "acc-checking";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function BankingDashboard() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<BankingTab>("overview");
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | null>(null);
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [selected, setSelected] = useState<{ transaction: Transaction; rect: DOMRect } | null>(
    null
  );
  const cardsPanelRef = useRef<CardsPanelHandle | null>(null);

  const checkingAccount = accounts.find((a) => a.id === CHECKING_ID)!;
  const otherAccountsTotal = accounts
    .filter((a) => a.id !== CHECKING_ID)
    .reduce((sum, a) => sum + a.balance, 0);

  const live = useLiveActivity(transactions, checkingAccount.balance, {
    accountId: CHECKING_ID,
  });

  const liveAccounts = useMemo(
    () => accounts.map((a) => (a.id === CHECKING_ID ? { ...a, balance: live.balance } : a)),
    [live.balance]
  );

  const liveTotalBalance = otherAccountsTotal + live.balance;

  const balanceRef = useCountUp(liveTotalBalance, formatUSD, [liveTotalBalance]);
  const gridRef = useGsapReveal<HTMLDivElement>([activeTab]);
  const insights = useMemo(() => buildInsights(), []);
  const moneyFlow = useMemo(() => buildMoneyFlow(), []);
  const maxCategory = Math.max(...categoryBreakdown.map((c) => c.amount));

  const navigateTo = (tab: BankingTab, sectionId?: string) => {
    setActiveTab(tab);
    if (sectionId) {
      requestAnimationFrame(() => {
        setTimeout(() => scrollToSection(sectionId), 60);
      });
    }
  };

  const handleExportStatement = () => generateStatementPdf(live.transactions, liveAccounts);

  const handleSelectTransaction = (transaction: Transaction, rect: DOMRect) =>
    setSelected({ transaction, rect });

  const handleAddMoney = () => {
  const input = window.prompt("How much would you like to add?", "100");
  if (!input) return;
  const amount = Number(input);
  if (!Number.isFinite(amount) || amount <= 0) return;
  live.addFunds(amount);
};

  return (
    <div className={theme === "light" ? "bank-light" : undefined}>
      <div className="flex flex-col gap-8 bg-bank-bg p-6 text-bank-text md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs uppercase tracking-[0.25em] text-bank-muted">
                Total balance across accounts
              </p>
              <button
                onClick={() => setBalancesHidden((h) => !h)}
                className="text-xs text-bank-muted hover:text-bank-text"
                aria-label={balancesHidden ? "Show balances" : "Hide balances"}
              >
                {balancesHidden ? "◎ Show" : "◉ Hide"}
              </button>
            </div>
            {balancesHidden ? (
              <span className="font-display text-4xl text-bank-text md:text-5xl">••••••</span>
            ) : (
              <span
                ref={balanceRef}
                className="tabular font-display text-4xl text-bank-text md:text-5xl"
              >
                $0.00
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CommandPalette
              accounts={accounts}
              onFreezeAll={() => cardsPanelRef.current?.freezeAll()}
              onNavigate={navigateTo}
              onExportStatement={handleExportStatement}
              onToggleBalances={() => setBalancesHidden((h) => !h)}
            />
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="rounded-lg border border-bank-border px-3 py-2 text-xs text-bank-muted transition-colors hover:text-bank-text hover:border-white"
            >
              {theme === "dark" ? "☾ Dark" : "☀ Light"}
            </button>
            <button  onClick={handleAddMoney}
            className="rounded-xl border bg-bank-mint px-4 py-2 text-sm font-medium text-bank-bg transition-colors hover:text-white hover:bg-bank-mint/40 hover:border-bank-mint">
              + Add money
            </button>
            <button
              onClick={handleExportStatement}
              className="rounded-xl border border-bank-border px-4 py-2 text-sm text-bank-text  hover:border-bank-mint/50"
            >
              ⬇ Statement
            </button>
          </div>
        </header>

        <BankingTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            <section>
              <InsightsCarousel insights={insights} />
            </section>

            <div
              id="section-accounts"
              ref={gridRef}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {liveAccounts.map((a) => (
                <AccountCard key={a.id} account={a} hidden={balancesHidden} />
              ))}
            </div>

            <section
              id="section-networth"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base text-bank-text">Net worth</h2>
                  <p className="text-xs text-bank-muted">
                    Trailing 7 months, with a 3-month forecast based on recent trend
                  </p>
                </div>
              </div>
              <NetWorthChart data={netWorthHistory} />
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-bank-border bg-bank-surface p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-base text-bank-text">
                    Income vs. spending
                  </h2>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-bank-muted">
                      <span className="h-2 w-2 rounded-full bg-bank-mint" /> Income
                    </span>
                    <span className="flex items-center gap-1.5 text-bank-muted">
                      <span className="h-2 w-2 rounded-full bg-bank-rose" /> Spending
                    </span>
                  </div>
                </div>
                <SpendingChart data={spendingHistory} />
              </section>

              <section className="rounded-2xl border border-bank-border bg-bank-surface p-5">
                <h2 className="mb-4 font-display text-base text-bank-text">
                  Spending by category
                </h2>
                <div className="flex flex-col gap-3">
                  {[...categoryBreakdown]
                    .sort((a, b) => b.amount - a.amount)
                    .map((c) => (
                      <button
                        key={c.category}
                        onClick={() => {
                          setCategoryFilter((prev) => (prev === c.category ? null : c.category));
                          navigateTo("transactions");
                        }}
                        className="flex flex-col gap-1 text-left"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize text-bank-muted">{c.category}</span>
                          <span className="tabular text-bank-text">${c.amount}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bank-surface-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(c.amount / maxCategory) * 100}%`,
                              background: CATEGORY_COLOR[c.category] ?? "#33d6ac",
                            }}
                          />
                        </div>
                      </button>
                    ))}
                </div>
                <p className="mt-3 text-[11px] text-bank-muted">
                  Click a category to filter transactions.
                </p>
              </section>
            </div>

            <section
              id="section-budgets"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <h2 className="mb-4 font-display text-base text-bank-text">Monthly budgets</h2>
              <BudgetRings budgets={budgets} />
            </section>

            <section
              id="section-moneyflow"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <div className="mb-2">
                <h2 className="font-display text-base text-bank-text">Money flow</h2>
                <p className="text-xs text-bank-muted">
                  Where this month's income went, checking account outward
                </p>
              </div>
              <MoneyFlowSankey data={moneyFlow} />
            </section>
          </div>
        )}

        {activeTab === "transactions" && (
          <section
            id="section-transactions"
            className="rounded-2xl border border-bank-border bg-bank-surface p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base text-bank-text">Transactions</h2>
              <button
                onClick={handleExportStatement}
                className="rounded-lg border border-bank-border px-3 py-1.5 text-xs text-bank-muted hover:text-bank-text"
              >
                ⬇ Export PDF
              </button>
            </div>
            <TransactionsList
              transactions={live.transactions}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onSelectTransaction={handleSelectTransaction}
            />
          </section>
        )}

        {activeTab === "cards" && (
          <div className="flex flex-col gap-6">
            <section
              id="section-cards"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <h2 className="mb-4 font-display text-base text-bank-text">Your cards</h2>
              <CardsPanel ref={cardsPanelRef} cards={cards} />
            </section>

            <section className="rounded-2xl border border-bank-border bg-bank-surface p-5">
              <h2 className="mb-4 font-display text-base text-bank-text">Quick transfer</h2>
              <QuickTransfer contacts={contacts} />
            </section>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section
              id="section-goals"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <h2 className="mb-4 font-display text-base text-bank-text">Savings goals</h2>
              <GoalsModule goals={goals} />
            </section>

            <section
              id="section-subscriptions"
              className="rounded-2xl border border-bank-border bg-bank-surface p-5"
            >
              <h2 className="mb-4 font-display text-base text-bank-text">Subscriptions</h2>
              <SubscriptionsTracker subscriptions={subscriptions} />
            </section>
          </div>
        )}
      </div>

      <LiveTicker toast={live.toast} />

      {selected && (
        <TransactionDetail
          transaction={selected.transaction}
          account={liveAccounts.find((a) => a.id === selected.transaction.accountId)}
          originRect={selected.rect}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}